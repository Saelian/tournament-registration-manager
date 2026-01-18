import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'
import waitlistService from '#services/waitlist_service'

export type IneligibilityReason =
  | 'POINTS_TOO_LOW'
  | 'POINTS_TOO_HIGH'
  | 'DAILY_LIMIT_REACHED'
  | 'TIME_CONFLICT'
  | 'GENDER_RESTRICTED'
  | 'CATEGORY_RESTRICTED'
  | 'ALREADY_REGISTERED'
  | 'NUMBERED_PLAYER_RESTRICTED'
  | 'WAITLIST_PRIORITY'

/**
 * Vérifie si un joueur est "numéroté" (classement mensuel commençant par 'N')
 * Exemples: N25, N785 = numéroté | 18, 1500 = non numéroté
 */
function isNumberedPlayer(clast: string | null | undefined): boolean {
  if (!clast) return false
  return clast.toUpperCase().startsWith('N')
}

export interface TableEligibility {
  table: Table
  isEligible: boolean
  reasons: IneligibilityReason[]
}

class RegistrationRulesService {
  /**
   * Filter tables based on player points, gender, category, and existing registrations.
   */
  async getEligibleTables(player: Player, tables: Table[]): Promise<TableEligibility[]> {
    // Fetch existing registrations for this player (only if player is persisted)
    let existingRegistrations: Registration[] = []
    if (player.id) {
      existingRegistrations = await Registration.query()
        .where('player_id', player.id)
        .whereIn('status', ['paid', 'pending_payment', 'waitlist'])
        .preload('table')
    }

    const registeredTableIds = new Set(existingRegistrations.map((r) => r.tableId))

    // Build a map of date+time to check for time conflicts with existing registrations
    const existingTimeSlots = new Map<string, boolean>()
    // Count non-special tables per day for daily limit check
    const nonSpecialCountByDay = new Map<string, number>()
    for (const reg of existingRegistrations) {
      if (reg.table) {
        const dateStr = reg.table.date.toISODate()
        const key = `${dateStr}|${reg.table.startTime}`
        existingTimeSlots.set(key, true)

        // Count non-special tables per day
        if (dateStr && !reg.table.isSpecial) {
          nonSpecialCountByDay.set(dateStr, (nonSpecialCountByDay.get(dateStr) || 0) + 1)
        }
      }
    }

    const eligibilityResults = tables.map((table) => {
      const reasons: IneligibilityReason[] = []

      // Check if already registered to this table
      if (registeredTableIds.has(table.id)) {
        reasons.push('ALREADY_REGISTERED')
      }

      // Check for time conflict with existing registrations
      const dateStr = table.date.toISODate()
      const timeKey = `${dateStr}|${table.startTime}`
      if (existingTimeSlots.has(timeKey) && !registeredTableIds.has(table.id)) {
        reasons.push('TIME_CONFLICT')
      }

      // Check daily limit (max 2 non-special tables per day)
      if (dateStr && !table.isSpecial && !registeredTableIds.has(table.id)) {
        const currentCount = nonSpecialCountByDay.get(dateStr) || 0
        if (currentCount >= 2) {
          reasons.push('DAILY_LIMIT_REACHED')
        }
      }

      // Check points eligibility
      if (player.points < table.pointsMin) {
        reasons.push('POINTS_TOO_LOW')
      }

      if (player.points > table.pointsMax) {
        reasons.push('POINTS_TOO_HIGH')
      }

      // Check gender restriction
      if (table.genderRestriction && player.sex !== table.genderRestriction) {
        reasons.push('GENDER_RESTRICTED')
      }

      // Check category restriction
      if (table.allowedCategories && table.allowedCategories.length > 0) {
        if (!player.category || !table.allowedCategories.includes(player.category as never)) {
          reasons.push('CATEGORY_RESTRICTED')
        }
      }

      // Vérifier restriction "non numérotés uniquement"
      if (table.nonNumberedOnly && isNumberedPlayer(player.clast)) {
        reasons.push('NUMBERED_PLAYER_RESTRICTED')
      }

      return {
        table,
        isEligible: reasons.length === 0,
        reasons,
      }
    })

    // Check WAITLIST_PRIORITY for each table asynchronously
    // If a waitlist exists for a table, new players will be added to the waitlist
    // Note: WAITLIST_PRIORITY is informational only - it doesn't block eligibility
    const results = await Promise.all(
      eligibilityResults.map(async (result) => {
        // Skip if already registered to this table
        if (result.reasons.includes('ALREADY_REGISTERED')) {
          return result
        }

        // Only check waitlist for persisted tables (with a valid id)
        if (result.table.id) {
          const hasWaitlist = await waitlistService.hasWaitlist(result.table.id)
          if (hasWaitlist) {
            // Add WAITLIST_PRIORITY as informational reason
            // This doesn't affect isEligible - player can still select the table
            // and will be added to the waitlist instead of being registered directly
            result.reasons.push('WAITLIST_PRIORITY')
          }
        }

        return result
      })
    )

    return results
  }

  /**
   * Check if the daily limit of tables is reached.
   * Max 2 tables per day, excluding special tables.
   * Only validates days where new tables are being added (existing registrations
   * may exceed the limit if added by an admin).
   */
  checkDailyLimit(newTables: Table[], existingRegistrations: Registration[]): { valid: boolean; error?: string } {
    // Track which days have new tables being added
    const daysWithNewTables = new Set<string>()
    for (const table of newTables) {
      const dateStr = table.date.toISODate()
      if (dateStr) {
        daysWithNewTables.add(dateStr)
      }
    }

    // Only check limits for days where we're adding new tables
    for (const dateStr of daysWithNewTables) {
      // Count existing non-special tables for this day
      const existingCount = existingRegistrations.filter((reg) => {
        if (!reg.table) return false
        const regDateStr = reg.table.date.toISODate()
        return regDateStr === dateStr && !reg.table.isSpecial
      }).length

      // Count new non-special tables for this day
      const newCount = newTables.filter((table) => {
        const tableDateStr = table.date.toISODate()
        return tableDateStr === dateStr && !table.isSpecial
      }).length

      const totalCount = existingCount + newCount
      if (totalCount > 2) {
        return {
          valid: false,
          error: `Daily limit exceeded for ${dateStr}: Max 2 tables allowed (excluding special tables).`,
        }
      }
    }

    return { valid: true }
  }

  /**
   * Check for schedule conflicts (same start time).
   */
  checkTimeConflicts(newTables: Table[], existingRegistrations: Registration[]): { valid: boolean; error?: string } {
    const tablesByDay = new Map<string, Table[]>()

    const addToMap = (table: Table) => {
      const dateStr = table.date.toISODate()
      if (!dateStr) return
      if (!tablesByDay.has(dateStr)) {
        tablesByDay.set(dateStr, [])
      }
      tablesByDay.get(dateStr)!.push(table)
    }

    existingRegistrations.forEach((reg) => {
      if (reg.table) addToMap(reg.table)
    })

    newTables.forEach(addToMap)

    for (const [date, tables] of tablesByDay) {
      const times = new Set<string>()
      for (const table of tables) {
        if (times.has(table.startTime)) {
          return {
            valid: false,
            error: `Schedule conflict on ${date}: Multiple tables start at ${table.startTime}.`,
          }
        }
        times.add(table.startTime)
      }
    }

    return { valid: true }
  }

  /**
   * Validate a selection of tables for a player.
   */
  async validateSelection(player: Player, newTables: Table[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // 1. Check points eligibility
    // Note: WAITLIST_PRIORITY is not a blocking reason - it just means the player will be added to waitlist
    const eligibility = await this.getEligibleTables(player, newTables)
    eligibility.forEach((e) => {
      const blockingReasons = e.reasons.filter((r) => r !== 'WAITLIST_PRIORITY')
      if (blockingReasons.length > 0) {
        errors.push(`Table ${e.table.name}: ${blockingReasons.join(', ')}`)
      }
    })

    // 2. Fetch existing registrations (including waitlist to prevent conflicts)
    const existingRegistrations = await Registration.query()
      .where('player_id', player.id)
      .whereIn('status', ['paid', 'pending_payment', 'waitlist'])
      .preload('table')

    // 3. Check daily limit
    const dailyLimit = this.checkDailyLimit(newTables, existingRegistrations)
    if (!dailyLimit.valid && dailyLimit.error) {
      errors.push(dailyLimit.error)
    }

    // 4. Check time conflicts
    const timeConflict = this.checkTimeConflicts(newTables, existingRegistrations)
    if (!timeConflict.valid && timeConflict.error) {
      errors.push(timeConflict.error)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

const registrationRulesService = new RegistrationRulesService()
export default registrationRulesService
