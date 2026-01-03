import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Payment from '#models/payment'
import Registration from '#models/registration'
import Tournament from '#models/tournament'
import User from '#models/user'
import adminNotificationService from '#services/admin_notification_service'

export type CancellationError =
  | 'REGISTRATION_NOT_FOUND'
  | 'PAYMENT_NOT_FOUND'
  | 'NOT_OWNER'
  | 'INVALID_STATUS'
  | 'REFUND_DEADLINE_PASSED'
  | 'MISSING_PAYMENT_ID'
  | 'REFUND_FAILED'

export interface CancellationResult {
  success: boolean
  error?: CancellationError
  message?: string
}

class CancellationService {
  /**
   * Unregister from a table without requesting a refund.
   * Only the registration is cancelled; the payment remains intact.
   */
  async unregisterWithoutRefund(
    registrationId: number,
    userId: number
  ): Promise<CancellationResult> {
    const registration = await Registration.find(registrationId)

    if (!registration) {
      return { success: false, error: 'REGISTRATION_NOT_FOUND' }
    }

    if (registration.userId !== userId) {
      return { success: false, error: 'NOT_OWNER' }
    }

    // Only allow cancellation for paid, waitlist, or pending_payment registrations
    if (!['paid', 'waitlist', 'pending_payment'].includes(registration.status)) {
      return {
        success: false,
        error: 'INVALID_STATUS',
        message: `Cannot cancel a registration with status '${registration.status}'`,
      }
    }

    registration.status = 'cancelled'
    await registration.save()

    return { success: true }
  }

  /**
   * Request a full refund for a payment.
   * The payment is marked as refund_requested and admins are notified.
   * Actual refund is processed manually by admin.
   */
  async requestFullRefund(paymentId: number, userId: number): Promise<CancellationResult> {
    const payment = await Payment.query()
      .where('id', paymentId)
      .preload('registrations', (query) => {
        query.preload('table')
      })
      .first()

    if (!payment) {
      return { success: false, error: 'PAYMENT_NOT_FOUND' }
    }

    if (payment.userId !== userId) {
      return { success: false, error: 'NOT_OWNER' }
    }

    // Allow refund request for succeeded payments
    if (payment.status !== 'succeeded') {
      return {
        success: false,
        error: 'INVALID_STATUS',
        message: `Cannot request refund for a payment with status '${payment.status}'`,
      }
    }

    // Check refund deadline
    const deadlineCheck = await this.checkRefundDeadline()
    if (!deadlineCheck.allowed) {
      return {
        success: false,
        error: 'REFUND_DEADLINE_PASSED',
        message: deadlineCheck.message,
      }
    }

    // Mark payment as refund_requested and cancel registrations
    await db.transaction(async (trx) => {
      payment.useTransaction(trx)
      payment.status = 'refund_requested'
      await payment.save()

      for (const registration of payment.registrations) {
        registration.useTransaction(trx)
        registration.status = 'cancelled'
        await registration.save()
      }
    })

    // Notify admins about the refund request
    const user = await User.find(payment.userId)
    if (user) {
      await adminNotificationService.notifyRefundRequest(payment, user)
    }

    return { success: true }
  }

  /**
   * Check if refund is still allowed based on tournament refund deadline.
   */
  async checkRefundDeadline(): Promise<{ allowed: boolean; message?: string }> {
    const tournament = await Tournament.first()

    if (!tournament) {
      return { allowed: false, message: 'Tournament not configured' }
    }

    const now = DateTime.now()

    // Use refundDeadline if set, otherwise use startDate
    let deadline: DateTime
    if (tournament.options.refundDeadline) {
      deadline = DateTime.fromISO(tournament.options.refundDeadline)
    } else {
      deadline = tournament.startDate
    }

    if (now > deadline) {
      const formattedDeadline = deadline.toFormat('dd/MM/yyyy')
      return {
        allowed: false,
        message: `La date limite de remboursement (${formattedDeadline}) est passée`,
      }
    }

    return { allowed: true }
  }

  /**
   * Get refund eligibility info for a payment.
   */
  async getRefundEligibility(paymentId: number, userId: number) {
    const payment = await Payment.query()
      .where('id', paymentId)
      .preload('registrations', (query) => {
        query.preload('table')
      })
      .first()

    if (!payment) {
      return { eligible: false, error: 'PAYMENT_NOT_FOUND' as const }
    }

    if (payment.userId !== userId) {
      return { eligible: false, error: 'NOT_OWNER' as const }
    }

    // Allow refund request only for succeeded payments
    if (payment.status !== 'succeeded') {
      return { eligible: false, error: 'INVALID_STATUS' as const, status: payment.status }
    }

    const deadlineCheck = await this.checkRefundDeadline()

    return {
      eligible: deadlineCheck.allowed,
      deadlinePassed: !deadlineCheck.allowed,
      deadlineMessage: deadlineCheck.message,
      amount: payment.amount,
      registrations: payment.registrations.map((r) => ({
        id: r.id,
        tableName: r.table?.name,
        status: r.status,
      })),
    }
  }
}

const cancellationService = new CancellationService()
export default cancellationService
