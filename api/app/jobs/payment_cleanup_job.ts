import Registration from '#models/registration'
import Payment from '#models/payment'
import helloAssoConfig from '#config/helloasso'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'

export default class PaymentCleanupJob {
    async run(): Promise<void> {
        const expirationMinutes = helloAssoConfig.paymentExpirationMinutes
        const expirationThreshold = DateTime.now().minus({ minutes: expirationMinutes })

        logger.info('Starting payment cleanup job', {
            expirationThreshold: expirationThreshold.toISO(),
        })

        await db.transaction(async (trx) => {
            // 1. Find standard expired registrations (not promoted)
            const standardExpiredRegistrations = await Registration.query({ client: trx })
                .where('status', 'pending_payment')
                .whereNull('promoted_at')
                .where('updated_at', '<', expirationThreshold.toSQL()!)

            // 2. Find promoted registrations and check against their specific timer
            const promotedRegistrations = await Registration.query({ client: trx })
                .where('status', 'pending_payment')
                .whereNotNull('promoted_at')
                .preload('table', (q) => q.preload('tournament'))

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
        })
    }
}
