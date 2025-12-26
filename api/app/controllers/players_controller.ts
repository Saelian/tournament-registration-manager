import type { HttpContext } from '@adonisjs/core/http'
import ffttService, { FFTTApiError } from '#services/fftt_service'

export default class PlayersController {
  async search({ request, response }: HttpContext) {
    const licence = request.input('licence')

    if (!licence) {
      return response.badRequest({ message: 'Licence is required' })
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
}
