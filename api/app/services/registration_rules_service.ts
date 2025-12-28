import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'

export type IneligibilityReason = 'POINTS_TOO_LOW' | 'POINTS_TOO_HIGH' | 'DAILY_LIMIT_REACHED' | 'TIME_CONFLICT' | 'GENDER_RESTRICTED' | 'CATEGORY_RESTRICTED' | 'ALREADY_REGISTERED'

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
    // Fetch existing registrations for this player
    const existingRegistrations = await Registration.query()
      .where('player_id', player.id)
      .whereIn('status', ['paid', 'pending_payment', 'waitlist'])
      .preload('table')

    const registeredTableIds = new Set(existingRegistrations.map(r => r.tableId))

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

    return tables.map((table) => {
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

      return {
        table,
        isEligible: reasons.length === 0,
        reasons
      }
    })
  }

  /**
   * Check if the daily limit of tables is reached.
   * Max 2 tables per day, excluding special tables.
   */
  checkDailyLimit(newTables: Table[], existingRegistrations: Registration[]): { valid: boolean, error?: string } {
    const tablesByDay = new Map<string, Table[]>()
    
    const addToMap = (table: Table) => {
      // Assuming table.date is a Luxon DateTime object
      const dateStr = table.date.toISODate()
      if (!dateStr) return
      if (!tablesByDay.has(dateStr)) {
        tablesByDay.set(dateStr, [])
      }
      tablesByDay.get(dateStr)!.push(table)
    }

    existingRegistrations.forEach(reg => {
      if (reg.table) addToMap(reg.table)
    })

    newTables.forEach(addToMap)

    for (const [date, tables] of tablesByDay) {
      const count = tables.filter(t => !t.isSpecial).length
      if (count > 2) {
        return { valid: false, error: `Daily limit exceeded for ${date}: Max 2 tables allowed (excluding special tables).` }
      }
    }

    return { valid: true }
  }

  /**
   * Check for schedule conflicts (same start time).
   */
  checkTimeConflicts(newTables: Table[], existingRegistrations: Registration[]): { valid: boolean, error?: string } {
    const tablesByDay = new Map<string, Table[]>()
    
    const addToMap = (table: Table) => {
      const dateStr = table.date.toISODate()
      if (!dateStr) return
      if (!tablesByDay.has(dateStr)) {
        tablesByDay.set(dateStr, [])
      }
      tablesByDay.get(dateStr)!.push(table)
    }

    existingRegistrations.forEach(reg => {
      if (reg.table) addToMap(reg.table)
    })

    newTables.forEach(addToMap)

    for (const [date, tables] of tablesByDay) {
      const times = new Set<string>()
      for (const table of tables) {
        if (times.has(table.startTime)) {
          return { valid: false, error: `Schedule conflict on ${date}: Multiple tables start at ${table.startTime}.` }
        }
        times.add(table.startTime)
      }
    }

    return { valid: true }
  }

  /**
   * Validate a selection of tables for a player.
   */
  async validateSelection(player: Player, newTables: Table[]): Promise<{ valid: boolean, errors: string[] }> {
    const errors: string[] = []

    // 1. Check points eligibility
    const eligibility = await this.getEligibleTables(player, newTables)
    eligibility.forEach(e => {
      if (!e.isEligible) {
        errors.push(`Table ${e.table.name}: ${e.reasons.join(', ')}`)
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
      errors
    }
  }
}

const registrationRulesService = new RegistrationRulesService()
export default registrationRulesService
