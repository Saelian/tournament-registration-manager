import db from '@adonisjs/lucid/services/db'
import Registration from '#models/registration'

class WaitlistService {
    /**
     * Recalculate waitlist ranks for a table after a removal.
     * Assigns sequential ranks (1, 2, 3...) based on original order.
     */
    async recalculateRanks(tableId: number): Promise<void> {
        const waitlistRegistrations = await Registration.query()
            .where('table_id', tableId)
            .where('status', 'waitlist')
            .orderBy('waitlist_rank', 'asc')

        // Reassign sequential ranks
        for (const [i, registration] of waitlistRegistrations.entries()) {
            const newRank = i + 1
            if (registration.waitlistRank !== newRank) {
                registration.waitlistRank = newRank
                await registration.save()
            }
        }
    }

    /**
     * Promote a waitlist registration to pending_payment status.
     * The user will need to pay within the configured timer.
     * Throws an error if no spot is available.
     */
    async promoteToPayment(registrationId: number): Promise<Registration> {
        const registration = await Registration.query().where('id', registrationId).preload('table').firstOrFail()

        if (registration.status !== 'waitlist') {
            throw new Error(`Cannot promote registration with status '${registration.status}'`)
        }

        const tableId = registration.tableId
        const table = registration.table

        // Check if there's an available spot in the table
        const confirmedCount = await Registration.query()
            .where('table_id', tableId)
            .whereIn('status', ['paid', 'pending_payment'])
            .count('* as total')
        const currentCount = Number(confirmedCount[0].$extras.total || 0)

        if (currentCount >= table.quota) {
            throw new Error(
                `Le tableau "${table.name}" est complet (${currentCount}/${table.quota}). Impossible de promouvoir ce joueur.`
            )
        }

        await db.transaction(async (trx) => {
            registration.useTransaction(trx)
            registration.status = 'pending_payment'
            registration.waitlistRank = null
            await registration.save()
        })

        // Recalculate ranks for remaining waitlist entries
        await this.recalculateRanks(tableId)

        // Reload to get fresh data
        await registration.refresh()
        return registration
    }

    /**
     * Get the count of waitlist registrations for a table.
     */
    async getWaitlistCount(tableId: number): Promise<number> {
        const result = await Registration.query()
            .where('table_id', tableId)
            .where('status', 'waitlist')
            .count('* as total')
            .first()

        return Number(result?.$extras.total || 0)
    }

    /**
     * Check if a table has any waitlist entries.
     */
    async hasWaitlist(tableId: number): Promise<boolean> {
        const count = await this.getWaitlistCount(tableId)
        return count > 0
    }

    /**
     * Get the next available rank for a new waitlist entry.
     */
    async getNextRank(tableId: number): Promise<number> {
        const result = await Registration.query()
            .where('table_id', tableId)
            .where('status', 'waitlist')
            .max('waitlist_rank as max_rank')
            .first()

        const maxRank = result?.$extras.max_rank || 0
        return maxRank + 1
    }
}

const waitlistService = new WaitlistService()
export default waitlistService
