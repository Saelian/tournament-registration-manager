import type { HttpContext } from '@adonisjs/core/http'
import Registration from '#models/registration'
import Player from '#models/player'
import Table from '#models/table'
import registrationRulesService from '#services/registration_rules_service'

export default class RegistrationsController {
  async validate({ request, response }: HttpContext) {
    const { playerId, tableIds } = request.all()

    if (!playerId || !tableIds || !Array.isArray(tableIds)) {
      return response.badRequest({ message: 'Invalid payload: playerId and tableIds (array) are required' })
    }

    const player = await Player.find(playerId)
    if (!player) {
      return response.notFound({ message: 'Player not found' })
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
