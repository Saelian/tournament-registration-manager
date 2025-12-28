import type { HttpContext } from '@adonisjs/core/http'
import Registration from '#models/registration'
import Player from '#models/player'
import Table from '#models/table'
import registrationRulesService from '#services/registration_rules_service'
import db from '@adonisjs/lucid/services/db'

export default class RegistrationsController {
  /**
   * Create registrations for selected tables.
   * Handles saturation: if table is full, adds to waitlist with calculated rank.
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { playerId, tableIds } = request.all()

    if (!playerId || !tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
      return response.badRequest({ message: 'Invalid payload: playerId and tableIds (non-empty array) are required' })
    }

    const player = await Player.find(playerId)
    if (!player) {
      return response.notFound({ message: 'Player not found' })
    }

    if (player.userId !== user.id) {
      return response.forbidden({ message: 'Cannot create registration for a player not linked to your account' })
    }

    const tables = await Table.query().whereIn('id', tableIds)
    if (tables.length !== tableIds.length) {
      return response.badRequest({ message: 'One or more tables not found' })
    }

    // Check for existing registrations (avoid duplicates) - must be before validation
    const existingRegistrations = await Registration.query()
      .where('player_id', player.id)
      .whereIn('table_id', tableIds)
      .whereNot('status', 'cancelled')

    if (existingRegistrations.length > 0) {
      const existingTableIds = existingRegistrations.map(r => r.tableId)
      return response.badRequest({
        message: 'Player is already registered for some of these tables',
        existingTableIds,
      })
    }

    // Validate selection with business rules
    const validation = await registrationRulesService.validateSelection(player, tables)
    if (!validation.valid) {
      return response.badRequest({
        message: 'Validation failed',
        errors: validation.errors,
      })
    }

    // Create registrations within a transaction
    const createdRegistrations = await db.transaction(async (trx) => {
      const registrations = []

      for (const table of tables) {
        // Count current active registrations for this table
        const activeCount = await Registration.query({ client: trx })
          .where('table_id', table.id)
          .whereIn('status', ['paid', 'pending_payment'])
          .count('* as total')

        const currentCount = Number(activeCount[0].$extras.total) || 0
        const isFull = currentCount >= table.quota

        let status: 'pending_payment' | 'waitlist'
        let waitlistRank: number | null = null

        if (isFull) {
          // Table is full, add to waitlist
          status = 'waitlist'
          // Calculate waitlist rank
          const maxRank = await Registration.query({ client: trx })
            .where('table_id', table.id)
            .where('status', 'waitlist')
            .max('waitlist_rank as maxRank')

          waitlistRank = (maxRank[0].$extras.maxRank || 0) + 1
        } else {
          status = 'pending_payment'
        }

        const registration = await Registration.create({
          userId: user.id,
          playerId: player.id,
          tableId: table.id,
          status,
          waitlistRank,
        }, { client: trx })

        registrations.push(registration)
      }

      return registrations
    })

    // Reload registrations with relations for response
    const registrationIds = createdRegistrations.map(r => r.id)
    const fullRegistrations = await Registration.query()
      .whereIn('id', registrationIds)
      .preload('table')
      .preload('player')

    return response.created({
      message: 'Registrations created successfully',
      registrations: fullRegistrations,
    })
  }

  /**
   * Get a single registration by ID.
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const registration = await Registration.query()
      .where('id', params.id)
      .preload('table', (query) => {
        query.preload('tournament')
      })
      .preload('player')
      .first()

    if (!registration) {
      return response.notFound({ message: 'Registration not found' })
    }

    if (registration.userId !== user.id) {
      return response.forbidden({ message: 'Cannot view registration of another user' })
    }

    return response.ok(registration)
  }

  async validate({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { playerId, tableIds } = request.all()

    if (!playerId || !tableIds || !Array.isArray(tableIds)) {
      return response.badRequest({ message: 'Invalid payload: playerId and tableIds (array) are required' })
    }

    const player = await Player.find(playerId)
    if (!player) {
      return response.notFound({ message: 'Player not found' })
    }

    if (player.userId !== user.id) {
      return response.forbidden({ message: 'Cannot validate registration for a player not linked to your account' })
    }

    const tables = await Table.query().whereIn('id', tableIds)
    if (tables.length !== tableIds.length) {
      return response.badRequest({ message: 'One or more tables not found' })
    }

    const validation = await registrationRulesService.validateSelection(player, tables)

    if (!validation.valid) {
      return response.badRequest({
        message: 'Validation failed',
        errors: validation.errors,
      })
    }

    return response.ok({ valid: true })
  }

  async myRegistrations({ auth, response }: HttpContext) {
    const user = auth.user!
    
    const registrations = await Registration.query()
      .where('user_id', user.id)
      .preload('table', (query) => {
        query.preload('tournament')
      })
      .preload('player')
      .orderBy('created_at', 'desc')

    return response.ok(registrations)
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const registration = await Registration.findOrFail(params.id)

    if (registration.userId !== user.id) {
      return response.forbidden({ message: 'Cannot cancel registration of another user' })
    }

    // TODO: Handle refunds if paid?
    // For now, just change status to cancelled or delete?
    // Proposal says "perform actions (unregister)".
    // Usually we might want to keep history, so update status to 'cancelled'.
    // Or delete if it's just a draft?
    // Task 1.3 says status includes 'cancelled'.
    // So I will set status to 'cancelled'.
    
    registration.status = 'cancelled'
    await registration.save()

    return response.ok({ message: 'Registration cancelled' })
  }
}
