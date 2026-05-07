import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Registration from '#models/registration'
import Table from '#models/table'
import { success, notFound } from '#helpers/api_response'

type PresenceStatus = 'unknown' | 'present' | 'absent'

/**
 * Controller for managing player check-in on tournament day
 */
export default class AdminCheckinController {
  /**
   * Get list of tournament days (distinct dates from tables)
   * GET /admin/checkin/days
   */
  async days(ctx: HttpContext) {
    const tables = await Table.query().select('date').distinct('date').orderBy('date', 'asc')

    const days = tables.map((t) => t.date.toISODate())

    return success(ctx, { days })
  }

  /**
   * Get players expected for a specific day with their presence status
   * GET /admin/checkin/:date/players
   */
  async players(ctx: HttpContext) {
    const { date } = ctx.params

    // Get all registrations for tables on this date
    const registrations = await Registration.query()
      .whereIn('status', ['paid', 'pending_payment'])
      .whereHas('table', (query) => {
        query.whereRaw('DATE(date) = ?', [date])
      })
      .preload('player')
      .preload('table')
      .preload('user')

    // Group by player to get unique players with their tables
    const playerMap = new Map<
      number,
      {
        playerId: number
        firstName: string
        lastName: string
        licence: string
        club: string
        presenceStatus: PresenceStatus
        checkedInAt: string | null
        tables: Array<{
          id: number
          name: string
          startTime: string
          registrationId: number
        }>
      }
    >()

    for (const reg of registrations) {
      const existing = playerMap.get(reg.playerId)

      if (existing) {
        existing.tables.push({
          id: reg.table.id,
          name: reg.table.name,
          startTime: reg.table.startTime,
          registrationId: reg.id,
        })
        // If any registration is checked in, the player is present
        if (reg.presenceStatus === 'present' && existing.presenceStatus !== 'present') {
          existing.presenceStatus = 'present'
          existing.checkedInAt = reg.checkedInAt ? reg.checkedInAt.toISO() : null
        } else if (reg.presenceStatus === 'absent' && existing.presenceStatus === 'unknown') {
          existing.presenceStatus = 'absent'
        }
      } else {
        playerMap.set(reg.playerId, {
          playerId: reg.playerId,
          firstName: reg.player.firstName,
          lastName: reg.player.lastName,
          licence: reg.player.licence,
          club: reg.player.club,
          presenceStatus: reg.presenceStatus || 'unknown',
          checkedInAt: reg.checkedInAt ? reg.checkedInAt.toISO() : null,
          tables: [
            {
              id: reg.table.id,
              name: reg.table.name,
              startTime: reg.table.startTime,
              registrationId: reg.id,
            },
          ],
        })
      }
    }

    // Convert to array and sort alphabetically
    const players = Array.from(playerMap.values())
      .map((p) => ({
        ...p,
        tables: p.tables.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }))
      .sort((a, b) => {
        const lastNameCmp = a.lastName.localeCompare(b.lastName)
        return lastNameCmp !== 0 ? lastNameCmp : a.firstName.localeCompare(b.firstName)
      })

    // Calculate stats with 3 categories
    const totalPlayers = players.length
    const presentCount = players.filter((p) => p.presenceStatus === 'present').length
    const absentCount = players.filter((p) => p.presenceStatus === 'absent').length
    const unknownCount = players.filter((p) => p.presenceStatus === 'unknown').length

    return success(ctx, {
      date,
      players,
      stats: {
        total: totalPlayers,
        present: presentCount,
        absent: absentCount,
        unknown: unknownCount,
      },
    })
  }

  /**
   * Check in a player (record timestamp and set status to 'present')
   * POST /admin/checkin/:registrationId
   */
  async checkin(ctx: HttpContext) {
    const { registrationId } = ctx.params

    const registration = await Registration.query()
      .where('id', registrationId)
      .whereIn('status', ['paid', 'pending_payment'])
      .preload('table')
      .preload('player')
      .first()

    if (!registration) {
      return notFound(ctx, 'Inscription non trouvée')
    }

    const now = DateTime.now()
    const tableDate = registration.table.date.toISODate()!

    // Check in all registrations for this player on this day
    await Registration.query()
      .where('player_id', registration.playerId)
      .whereIn('status', ['paid', 'pending_payment'])
      .whereHas('table', (query) => {
        query.whereRaw('DATE(date) = ?', [tableDate])
      })
      .update({
        checkedInAt: now.toSQL(),
        presenceStatus: 'present',
      })

    return success(ctx, {
      playerId: registration.playerId,
      playerName: `${registration.player.firstName} ${registration.player.lastName}`,
      presenceStatus: 'present' as PresenceStatus,
      checkedInAt: now.toISO(),
    })
  }

  /**
   * Mark a player as absent
   * POST /admin/checkin/:registrationId/absent
   */
  async markAbsent(ctx: HttpContext) {
    const { registrationId } = ctx.params

    const registration = await Registration.query()
      .where('id', registrationId)
      .whereIn('status', ['paid', 'pending_payment'])
      .preload('table')
      .preload('player')
      .first()

    if (!registration) {
      return notFound(ctx, 'Inscription non trouvée')
    }

    const tableDate = registration.table.date.toISODate()!

    // Mark all registrations for this player on this day as absent
    await Registration.query()
      .where('player_id', registration.playerId)
      .whereIn('status', ['paid', 'pending_payment'])
      .whereHas('table', (query) => {
        query.whereRaw('DATE(date) = ?', [tableDate])
      })
      .update({
        checkedInAt: null as unknown as DateTime,
        presenceStatus: 'absent',
      })

    return success(ctx, {
      playerId: registration.playerId,
      playerName: `${registration.player.firstName} ${registration.player.lastName}`,
      presenceStatus: 'absent' as PresenceStatus,
      checkedInAt: null,
    })
  }

  /**
   * Reset presence status to unknown (cancel check-in or absence)
   * DELETE /admin/checkin/:registrationId
   */
  async cancelCheckin(ctx: HttpContext) {
    const { registrationId } = ctx.params

    const registration = await Registration.query()
      .where('id', registrationId)
      .whereIn('status', ['paid', 'pending_payment'])
      .preload('table')
      .preload('player')
      .first()

    if (!registration) {
      return notFound(ctx, 'Inscription non trouvée')
    }

    const tableDate = registration.table.date.toISODate()!

    // Reset all registrations for this player on this day to unknown
    await Registration.query()
      .where('player_id', registration.playerId)
      .whereIn('status', ['paid', 'pending_payment'])
      .whereHas('table', (query) => {
        query.whereRaw('DATE(date) = ?', [tableDate])
      })
      .update({
        checkedInAt: null as unknown as DateTime,
        presenceStatus: 'unknown',
      })

    return success(ctx, {
      playerId: registration.playerId,
      playerName: `${registration.player.firstName} ${registration.player.lastName}`,
      presenceStatus: 'unknown' as PresenceStatus,
      checkedInAt: null,
    })
  }
}
