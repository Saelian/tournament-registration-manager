import type { HttpContext } from '@adonisjs/core/http'
import ffttService, { FFTTApiError } from '#services/fftt_service'
import Player from '#models/player'

export default class PlayersController {
  private static readonly LICENCE_REGEX = /^\d{6,8}$/

  async search({ request, response }: HttpContext) {
    const licence = request.input('licence')

    if (!licence) {
      return response.badRequest({ message: 'Licence is required' })
    }

    if (!PlayersController.LICENCE_REGEX.test(licence)) {
      return response.badRequest({ message: 'Invalid licence format. Must be 6 to 8 digits.' })
    }

    try {
      const player = await ffttService.searchByLicence(licence)

      if (!player) {
        return response.notFound({ message: 'Player not found' })
      }

      return response.ok(player)
    } catch (error) {
      if (error instanceof FFTTApiError) {
        // API is unavailable - client can offer manual entry with toVerify flag
        return response.serviceUnavailable({
          message: 'FFTT API unavailable',
          allowManualEntry: true,
        })
      }
      throw error
    }
  }

  async linkToUser({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = request.only([
      'licence',
      'firstName',
      'lastName',
      'club',
      'points',
      'sex',
      'category',
      'needsVerification',
    ])

    // Try to find existing player by licence
    let player = await Player.findBy('licence', data.licence)

    if (player) {
      // If player exists, update it and link to user
      player.merge({
        ...data,
        userId: user.id,
      })
      await player.save()
    } else {
      // Create new player linked to user
      player = await Player.create({
        ...data,
        userId: user.id,
      })
    }

    return response.ok(player)
  }

  /**
   * Find or create a player without linking to a user.
   * Used when registering another player (not self).
   */
  async findOrCreate({ request, response }: HttpContext) {
    const data = request.only([
      'licence',
      'firstName',
      'lastName',
      'club',
      'points',
      'sex',
      'category',
      'needsVerification',
    ])

    if (!data.licence) {
      return response.badRequest({ message: 'Licence is required' })
    }

    // Try to find existing player by licence
    let player = await Player.findBy('licence', data.licence)

    if (player) {
      // Update player data (FFTT data may have changed)
      player.merge({
        firstName: data.firstName,
        lastName: data.lastName,
        club: data.club,
        points: data.points,
        sex: data.sex,
        category: data.category,
      })
      await player.save()
    } else {
      // Create new player without user link
      player = await Player.create({
        ...data,
        userId: null,
      })
    }

    return response.ok(player)
  }
}
