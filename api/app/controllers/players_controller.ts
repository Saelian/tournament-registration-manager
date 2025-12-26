import type { HttpContext } from '@adonisjs/core/http'
import ffttService from '#services/fftt_service'

export default class PlayersController {
  async search({ request, response }: HttpContext) {
    const licence = request.input('licence')

    if (!licence) {
      return response.badRequest({ message: 'Licence is required' })
    }

    const player = await ffttService.searchByLicence(licence)

    if (!player) {
      return response.notFound({ message: 'Player not found' })
    }

    return response.ok(player)
  }
}
