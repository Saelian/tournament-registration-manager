import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'

export type IneligibilityReason = 'POINTS_TOO_LOW' | 'POINTS_TOO_HIGH' | 'DAILY_LIMIT_REACHED' | 'TIME_CONFLICT'

export interface TableEligibility {
  table: Table
  isEligible: boolean
  reasons: IneligibilityReason[]
}

class RegistrationRulesService {
  /**
   * Filter tables based on player points.
   */
  async getEligibleTables(player: Player, tables: Table[]): Promise<TableEligibility[]> {
    return tables.map((table) => {
      const reasons: IneligibilityReason[] = []
      
      // Handle case where points are null/undefined? Player points is number.
      // If table points limits are not set? They are number in model.
      
      if (player.points < table.pointsMin) {
        reasons.push('POINTS_TOO_LOW')
      }
      
      if (player.points > table.pointsMax) {
        reasons.push('POINTS_TOO_HIGH')
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

    // 2. Fetch existing registrations
    const existingRegistrations = await Registration.query()
      .where('player_id', player.id)
      .whereIn('status', ['paid', 'pending_payment'])
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
