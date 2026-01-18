import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import Registration from '#models/registration'
import Payment from '#models/payment'
import helloAssoService from '#services/hello_asso_service'
import cancellationService from '#services/cancellation_service'
import { generatePaymentReference } from '#helpers/payment_reference'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'

export default class PaymentsController {
  /**
   * Create a payment intent for unpaid registrations.
   * Calculates total from table prices and creates HelloAsso checkout.
   *
   * If a pending Payment already exists for the requested registrations,
   * it will be reused instead of creating a new one.
   */
  async createIntent({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { registrationIds } = request.all()

    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return response.badRequest({
        message: 'Invalid payload: registrationIds (non-empty array) is required',
      })
    }

    const registrations = await Registration.query()
      .whereIn('id', registrationIds)
      .where('user_id', user.id)
      .where('status', 'pending_payment')
      .preload('table')
      .preload('player')

    if (registrations.length !== registrationIds.length) {
      return response.badRequest({
        message: 'One or more registrations not found, not owned by you, or not pending payment',
      })
    }

    const totalAmountEuros = registrations.reduce((sum, reg) => {
      return sum + Number(reg.table.price)
    }, 0)

    const totalAmountCents = Math.round(totalAmountEuros * 100)

    if (totalAmountCents < 100) {
      return response.badRequest({
        message: 'Total amount must be at least 1 euro',
      })
    }

    // Generate a descriptive payment reference for HelloAsso
    const itemName = generatePaymentReference(registrations)

    const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:5173')

    const backUrl = `${frontendUrl}/registration`
    const returnUrl = `${frontendUrl}/payment/callback?status=success`
    const errorUrl = `${frontendUrl}/payment/callback?status=error`

    try {
      // Check if there's an existing pending Payment for these registrations
      const existingPayment = await Payment.query()
        .where('user_id', user.id)
        .where('status', 'pending')
        .whereHas('registrations', (query) => {
          query.whereIn('registrations.id', registrationIds)
        })
        .orderBy('created_at', 'desc')
        .first()

      if (existingPayment) {
        // Always create a new checkout - HelloAsso may have purged the old one
        // even if the API still returns it (the redirect page returns 404).
        // We keep the same Payment but regenerate the checkout.
        const checkoutResponse = await helloAssoService.initCheckout({
          totalAmount: totalAmountCents,
          itemName,
          backUrl,
          returnUrl,
          errorUrl,
          payer: {
            firstName: 'firstName' in user ? (user.firstName ?? undefined) : undefined,
            lastName: 'lastName' in user ? (user.lastName ?? undefined) : undefined,
            email: user.email,
          },
          metadata: {
            paymentId: String(existingPayment.id),
            userId: String(user.id),
            registrationIds: registrationIds.join(','),
          },
        })

        // Update existing Payment with new checkout ID and amount
        existingPayment.helloassoCheckoutIntentId = String(checkoutResponse.id)
        existingPayment.amount = totalAmountCents
        await existingPayment.save()

        return response.ok({
          paymentId: existingPayment.id,
          redirectUrl: checkoutResponse.redirectUrl,
        })
      }

      // No existing Payment, create a new one
      const payment = await db.transaction(async (trx) => {
        const newPayment = await Payment.create(
          {
            userId: user.id,
            helloassoCheckoutIntentId: `pending_${randomUUID()}`, // Will be updated after checkout creation
            amount: totalAmountCents,
            status: 'pending',
          },
          { client: trx }
        )

        await newPayment.related('registrations').attach(registrationIds, trx)

        return newPayment
      })

      // Create checkout with our paymentId in metadata
      const checkoutResponse = await helloAssoService.initCheckout({
        totalAmount: totalAmountCents,
        itemName,
        backUrl,
        returnUrl,
        errorUrl,
        payer: {
          firstName: 'firstName' in user ? (user.firstName ?? undefined) : undefined,
          lastName: 'lastName' in user ? (user.lastName ?? undefined) : undefined,
          email: user.email,
        },
        metadata: {
          paymentId: String(payment.id),
          userId: String(user.id),
          registrationIds: registrationIds.join(','),
        },
      })

      // Update payment with the actual checkoutIntentId
      payment.helloassoCheckoutIntentId = String(checkoutResponse.id)
      await payment.save()

      return response.ok({
        paymentId: payment.id,
        redirectUrl: checkoutResponse.redirectUrl,
      })
    } catch (error) {
      console.error('HelloAsso checkout error:', error)
      return response.internalServerError({
        message: 'Failed to create payment intent',
      })
    }
  }

  /**
   * Get payment status by ID.
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const payment = await Payment.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('registrations', (query) => {
        query.preload('table').preload('player')
      })
      .first()

    if (!payment) {
      return response.notFound({ message: 'Payment not found' })
    }

    return response.ok(payment)
  }

  /**
   * Get all payments for the current user.
   */
  async myPayments({ auth, response }: HttpContext) {
    const user = auth.user!

    const payments = await Payment.query()
      .where('user_id', user.id)
      .preload('registrations', (query) => {
        query
          .preload('table', (tableQuery) => {
            tableQuery.preload('tournament')
          })
          .preload('player')
      })
      .orderBy('created_at', 'desc')

    return response.ok(payments)
  }

  /**
   * Request a full refund for a payment.
   * All registrations linked to this payment will be cancelled.
   */
  async refund({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const result = await cancellationService.requestFullRefund(Number(params.id), user.id)

    if (!result.success) {
      switch (result.error) {
        case 'PAYMENT_NOT_FOUND':
          return response.notFound({ message: 'Payment not found' })
        case 'NOT_OWNER':
          return response.forbidden({ message: 'Cannot refund payment of another user' })
        case 'INVALID_STATUS':
          return response.badRequest({ message: result.message || 'Invalid payment status' })
        case 'REFUND_DEADLINE_PASSED':
          return response.badRequest({
            code: 'REFUND_DEADLINE_PASSED',
            message: result.message || 'Refund deadline has passed',
          })
        case 'MISSING_PAYMENT_ID':
          return response.badRequest({
            code: 'MISSING_PAYMENT_ID',
            message: result.message || 'Missing HelloAsso payment ID',
          })
        case 'REFUND_FAILED':
          return response.internalServerError({
            code: 'REFUND_FAILED',
            message: result.message || 'Refund failed',
          })
        default:
          return response.internalServerError({ message: 'An error occurred' })
      }
    }

    return response.ok({ message: 'Refund processed successfully' })
  }

  /**
   * Get refund eligibility for a payment.
   */
  async refundEligibility({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const result = await cancellationService.getRefundEligibility(Number(params.id), user.id)

    if ('error' in result) {
      switch (result.error) {
        case 'PAYMENT_NOT_FOUND':
          return response.notFound({ message: 'Payment not found' })
        case 'NOT_OWNER':
          return response.forbidden({ message: 'Cannot view payment of another user' })
        default:
          return response.ok(result)
      }
    }

    return response.ok(result)
  }
}
