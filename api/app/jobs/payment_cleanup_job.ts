import Registration from '#models/registration'
import Payment from '#models/payment'
import helloAssoConfig from '#config/helloasso'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import mailService from '#services/mail_service'

interface EmailData {
  email: string
  cancelledEntries: Array<{ playerFirstName: string; playerLastName: string; tableName: string }>
}

export default class PaymentCleanupJob {
  async run(): Promise<void> {
    const expirationMinutes = helloAssoConfig.paymentExpirationMinutes
    const expirationThreshold = DateTime.now().minus({ minutes: expirationMinutes })

    logger.info('Starting payment cleanup job', {
      expirationThreshold: expirationThreshold.toISO(),
    })

    const emailsToSend: EmailData[] = []

    await db.transaction(async (trx) => {
      // 1. Find standard expired registrations (not promoted)
      const standardExpiredRegistrations = await Registration.query({ client: trx })
        .where('status', 'pending_payment')
        .where('is_admin_created', false)
        .whereNull('promoted_at')
        .where('updated_at', '<', expirationThreshold.toSQL()!)
        .preload('user')
        .preload('player')
        .preload('table')

      // 2. Find promoted registrations and check against their specific timer
      const promotedRegistrations = await Registration.query({ client: trx })
        .where('status', 'pending_payment')
        .where('is_admin_created', false)
        .whereNotNull('promoted_at')
        .preload('table', (q) => q.preload('tournament'))
        .preload('user')
        .preload('player')

      const promotedExpiredRegistrations = promotedRegistrations.filter((reg) => {
        if (!reg.promotedAt) return false

        const timerHours = reg.table.tournament.options.waitlistTimerHours || 4
        // Calculate cutoff time for this specific registration
        const promotedExpirationThreshold = DateTime.now().minus({ hours: timerHours })

        return reg.promotedAt < promotedExpirationThreshold
      })

      const allExpiredRegistrations = [...standardExpiredRegistrations, ...promotedExpiredRegistrations]

      if (allExpiredRegistrations.length === 0) {
        logger.info('No expired registrations found')
        return
      }

      const registrationIds = allExpiredRegistrations.map((r) => r.id)

      await Registration.query({ client: trx }).whereIn('id', registrationIds).update({ status: 'cancelled' })

      const expiredPayments = await Payment.query({ client: trx })
        .where('status', 'pending')
        .whereHas('registrations', (query) => {
          query.whereIn('registrations.id', registrationIds)
        })

      if (expiredPayments.length > 0) {
        const paymentIds = expiredPayments.map((p) => p.id)
        await Payment.query({ client: trx }).whereIn('id', paymentIds).update({ status: 'expired' })

        logger.info('Expired payments updated', { count: paymentIds.length })
      }

      logger.info('Expired registrations cancelled', {
        count: registrationIds.length,
        standard: standardExpiredRegistrations.length,
        promoted: promotedExpiredRegistrations.length,
      })

      // Collect email data for non-admin-created registrations, grouped by user
      const emailableRegistrations = allExpiredRegistrations.filter((r) => !r.isAdminCreated)
      const byUser = new Map<number, { email: string; entries: Array<{ playerFirstName: string; playerLastName: string; tableName: string }> }>()

      for (const reg of emailableRegistrations) {
        const existing = byUser.get(reg.userId)
        const entry = {
          playerFirstName: reg.player.firstName,
          playerLastName: reg.player.lastName,
          tableName: reg.table.name,
        }

        if (existing) {
          existing.entries.push(entry)
        } else {
          byUser.set(reg.userId, {
            email: reg.user.email,
            entries: [entry],
          })
        }
      }

      for (const [, data] of byUser) {
        emailsToSend.push({
          email: data.email,
          cancelledEntries: data.entries,
        })
      }
    })

    // Send emails after transaction commit
    const registrationUrl = env.get('FRONTEND_URL', 'http://localhost:5173')

    for (const emailData of emailsToSend) {
      try {
        await mailService.sendRegistrationExpired({
          email: emailData.email,
          cancelledEntries: emailData.cancelledEntries,
          registrationUrl,
        })
      } catch (error) {
        logger.error('Failed to send registration expired email', {
          email: emailData.email,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }
}
