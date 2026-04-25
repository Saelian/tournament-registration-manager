import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import Payment from '#models/payment'
import Registration from '#models/registration'
import Tournament from '#models/tournament'
import User from '#models/user'
import adminNotificationService from '#services/admin_notification_service'
import waitlistService from '#services/waitlist_service'

export type CancellationError =
  | 'REGISTRATION_NOT_FOUND'
  | 'PAYMENT_NOT_FOUND'
  | 'NOT_OWNER'
  | 'INVALID_STATUS'
  | 'REFUND_DEADLINE_PASSED'
  | 'MISSING_PAYMENT_ID'
  | 'REFUND_FAILED'
  | 'NO_ACTIVE_REGISTRATIONS'

export interface CancellationResult {
  success: boolean
  error?: CancellationError
  message?: string
}

export interface CancellationRefundPayload {
  refundStatus: 'none' | 'requested' | 'done'
  refundMethod?: 'cash' | 'check' | 'bank_transfer'
}

class CancellationService {
  /**
   * Unregister from a table without requesting a refund.
   * Only the registration is cancelled; the payment remains intact.
   */
  async unregisterWithoutRefund(registrationId: number, userId: number): Promise<CancellationResult> {
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

    const wasWaitlist = registration.status === 'waitlist'
    const tableId = registration.tableId

    registration.status = 'cancelled'
    registration.waitlistRank = null
    await registration.save()

    // Recalculate waitlist ranks if the cancelled registration was on the waitlist
    if (wasWaitlist) {
      await waitlistService.recalculateRanks(tableId)
    }

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

    // Notify admins about the refund request (non-blocking: email failure should not fail the refund request)
    const user = await User.find(payment.userId)
    if (user) {
      try {
        await adminNotificationService.notifyRefundRequest(payment, user)
      } catch (emailError) {
        logger.error({ err: emailError, paymentId: payment.id }, 'Failed to send refund request notification to admins')
      }
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
   * Cancel a single registration as admin, with refund tracking.
   * Payments are NOT modified (partial cancellation: payment may cover other active registrations).
   */
  async adminCancelRegistration(
    registrationId: number,
    adminId: number,
    payload: CancellationRefundPayload
  ): Promise<CancellationResult> {
    const registration = await Registration.find(registrationId)

    if (!registration) {
      return { success: false, error: 'REGISTRATION_NOT_FOUND' }
    }

    if (!['paid', 'pending_payment', 'waitlist'].includes(registration.status)) {
      return {
        success: false,
        error: 'INVALID_STATUS',
        message: `Cannot cancel a registration with status '${registration.status}'`,
      }
    }

    const wasWaitlist = registration.status === 'waitlist'
    const tableId = registration.tableId

    registration.status = 'cancelled'
    registration.waitlistRank = null
    registration.cancelledByAdminId = adminId
    registration.refundStatus = payload.refundStatus
    registration.refundMethod = payload.refundMethod ?? null
    registration.refundedAt = payload.refundStatus === 'done' ? DateTime.now() : null
    await registration.save()

    if (wasWaitlist) {
      await waitlistService.recalculateRanks(tableId)
    }

    return { success: true }
  }

  /**
   * Cancel all active registrations for a player as admin, with refund tracking.
   * Updates linked payments based on refundStatus:
   *   'requested' → payment moves to 'refund_requested'
   *   'done'      → payment moves to 'refunded' with refundedAt and refundMethod
   *   'none'      → payments unchanged
   * Already-refunded payments are skipped.
   */
  async adminCancelAllRegistrations(
    playerId: number,
    adminId: number,
    payload: CancellationRefundPayload
  ): Promise<CancellationResult> {
    const activeRegistrations = await Registration.query()
      .where('player_id', playerId)
      .whereIn('status', ['paid', 'pending_payment', 'waitlist'])
      .preload('payments')

    if (activeRegistrations.length === 0) {
      return { success: false, error: 'NO_ACTIVE_REGISTRATIONS' }
    }

    const waitlistTableIds: number[] = activeRegistrations
      .filter((r) => r.status === 'waitlist')
      .map((r) => r.tableId)

    await db.transaction(async (trx) => {
      const now = DateTime.now()

      // Cancel all active registrations
      for (const registration of activeRegistrations) {
        registration.useTransaction(trx)
        registration.status = 'cancelled'
        registration.waitlistRank = null
        registration.cancelledByAdminId = adminId
        registration.refundStatus = payload.refundStatus
        registration.refundMethod = payload.refundMethod ?? null
        registration.refundedAt = payload.refundStatus === 'done' ? now : null
        await registration.save()
      }

      // Update payments if needed
      if (payload.refundStatus !== 'none') {
        // Collect unique payment IDs across all registrations
        const paymentIds = new Set<number>()
        for (const registration of activeRegistrations) {
          for (const payment of registration.payments) {
            paymentIds.add(payment.id)
          }
        }

        for (const paymentId of paymentIds) {
          const payment = await Payment.query({ client: trx }).where('id', paymentId).first()
          if (!payment) continue
          // Skip payments already in a refunded/refund_requested state
          if (['refunded', 'refund_requested', 'refund_pending'].includes(payment.status)) continue

          if (payload.refundStatus === 'requested') {
            payment.status = 'refund_requested'
          } else {
            // 'done'
            payment.status = 'refunded'
            payment.refundedAt = now
            payment.refundMethod =
              payload.refundMethod === 'bank_transfer'
                ? 'bank_transfer'
                : payload.refundMethod === 'cash'
                  ? 'cash'
                  : null
          }
          await payment.save()
        }
      }
    })

    // Recalculate waitlist ranks for affected tables
    for (const tableId of waitlistTableIds) {
      await waitlistService.recalculateRanks(tableId)
    }

    return { success: true }
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
