import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Payment from '#models/payment'
import Registration from '#models/registration'
import { success, error, notFound } from '#helpers/api_response'
import { processRefundValidator } from '#validators/payment'

interface RegistrationDetail {
  id: number
  status: string
  createdAt: string
  player: {
    id: number
    firstName: string
    lastName: string
    licence: string
    club: string
  }
  table: {
    id: number
    name: string
    date: string
    startTime: string
    price: number
  }
}

interface PaymentData {
  id: number
  amount: number
  status: string
  paymentMethod: string
  createdAt: string
  refundedAt: string | null
  refundMethod: string | null
  helloassoOrderId: string | null
  subscriber: {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
  }
  registrationsCount: number
  registrations: RegistrationDetail[]
}

export default class AdminPaymentsController {
  /**
   * List all payments with pagination, filtering and sorting.
   * GET /admin/payments
   */
  async index(ctx: HttpContext) {
    const { status, paymentMethod, search, sortBy = 'created_at', sortOrder = 'desc' } = ctx.request.qs()

    let query = Payment.query()
      .preload('user')
      .preload('registrations', (regQuery) => {
        regQuery.preload('player').preload('table')
      })

    // Filter by status
    if (status) {
      query = query.where('status', status)
    }

    // Filter by payment method
    if (paymentMethod) {
      query = query.where('payment_method', paymentMethod)
    }

    // Search by user name or email
    if (search) {
      query = query.whereHas('user', (userQuery) => {
        userQuery
          .whereILike('email', `%${search}%`)
          .orWhereILike('first_name', `%${search}%`)
          .orWhereILike('last_name', `%${search}%`)
      })
    }

    // Sorting
    const validSortColumns = ['created_at', 'amount', 'status']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const order = sortOrder === 'asc' ? 'asc' : 'desc'
    query = query.orderBy(sortColumn, order)

    const payments = await query.exec()

    // Partial refunds: admin-cancelled registrations (pending and processed)
    const partialRefundRegs = await Registration.query()
      .whereNotNull('cancelled_by_admin_id')
      .whereIn('refund_status', ['requested', 'done'])
      .preload('player')
      .preload('table')
      .preload('user')
      .preload('cancelledByAdmin')
      .preload('payments')

    const partialRefunds = partialRefundRegs.map((reg) => {
      const linkedPayment = reg.payments[0] ?? null
      return {
        registrationId: reg.id,
        paymentId: linkedPayment?.id ?? null,
        originalPaymentMethod: linkedPayment?.paymentMethod ?? null,
        playerId: reg.player.id,
        playerName: `${reg.player.firstName} ${reg.player.lastName}`,
        playerLicence: reg.player.licence,
        tableName: reg.table.name,
        amountCents: Math.round(reg.table.price * 100),
        cancelledAt: reg.updatedAt.toISO()!,
        cancelledByAdminName: reg.cancelledByAdmin?.fullName ?? null,
        refundStatus: reg.refundStatus as 'requested' | 'done',
        refundMethod: reg.refundMethod,
        refundedAt: reg.refundedAt?.toISO() ?? null,
        subscriber: {
          id: reg.user.id,
          firstName: reg.user.firstName,
          lastName: reg.user.lastName,
          email: reg.user.email,
        },
      }
    })

    const pendingPartialCount = partialRefunds.filter((r) => r.refundStatus === 'requested').length

    // Count pending refund requests (payment-level + registration-level)
    const pendingRefundCount = await Payment.query().where('status', 'refund_requested').count('* as total')
    const pendingRefunds = Number(pendingRefundCount[0].$extras.total) + pendingPartialCount

    const formattedPayments: PaymentData[] = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod ?? 'helloasso',
      createdAt: payment.createdAt.toISO()!,
      refundedAt: payment.refundedAt?.toISO() ?? null,
      refundMethod: payment.refundMethod,
      helloassoOrderId: payment.helloassoOrderId,
      subscriber: {
        id: payment.user.id,
        firstName: payment.user.firstName,
        lastName: payment.user.lastName,
        email: payment.user.email,
        phone: payment.user.phone,
      },
      registrationsCount: payment.registrations.length,
      registrations: payment.registrations.map((reg) => ({
        id: reg.id,
        status: reg.status,
        createdAt: reg.createdAt.toISO()!,
        player: {
          id: reg.player.id,
          firstName: reg.player.firstName,
          lastName: reg.player.lastName,
          licence: reg.player.licence,
          club: reg.player.club,
        },
        table: {
          id: reg.table.id,
          name: reg.table.name,
          date: reg.table.date.toISODate()!,
          startTime: reg.table.startTime,
          price: reg.table.price,
        },
      })),
    }))

    return success(ctx, {
      payments: formattedPayments,
      pendingRefunds,
      partialRefunds,
    })
  }

  /**
   * Process a refund request.
   * POST /admin/payments/:id/process-refund
   */
  async processRefund(ctx: HttpContext) {
    const paymentId = ctx.params.id
    const payload = await ctx.request.validateUsing(processRefundValidator)

    const payment = await Payment.find(paymentId)
    if (!payment) {
      return notFound(ctx, 'Payment not found')
    }

    if (payment.status !== 'refund_requested') {
      return error(ctx, 'INVALID_STATUS', `Cannot process refund for a payment with status '${payment.status}'`, 400)
    }

    // Mark as refunded
    payment.status = 'refunded'
    payment.refundedAt = DateTime.now()
    payment.refundMethod = payload.refundMethod
    await payment.save()

    return success(ctx, {
      id: payment.id,
      status: payment.status,
      refundedAt: payment.refundedAt.toISO(),
      refundMethod: payment.refundMethod,
    })
  }

  /**
   * Mark an offline payment as collected.
   * PATCH /admin/payments/:id/collect
   */
  async collect(ctx: HttpContext) {
    const paymentId = ctx.params.id

    const payment = await Payment.query().where('id', paymentId).preload('registrations').first()

    if (!payment) {
      return notFound(ctx, 'Payment not found')
    }

    // Only offline payments can be collected
    if (payment.paymentMethod === 'helloasso') {
      return error(ctx, 'INVALID_PAYMENT_METHOD', 'HelloAsso payments cannot be manually collected', 400)
    }

    if (payment.status !== 'pending') {
      return error(ctx, 'INVALID_STATUS', `Cannot collect a payment with status '${payment.status}'`, 400)
    }

    // Update payment status
    payment.status = 'succeeded'
    await payment.save()

    // Update all related registrations to paid
    for (const registration of payment.registrations) {
      if (registration.status === 'pending_payment') {
        registration.status = 'paid'
        await registration.save()
      }
    }

    return success(ctx, {
      id: payment.id,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      registrations: payment.registrations.map((r) => ({
        id: r.id,
        status: r.status,
      })),
    })
  }
}
