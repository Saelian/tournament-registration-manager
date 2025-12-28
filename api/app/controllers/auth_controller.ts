import type { HttpContext } from '@adonisjs/core/http'
import OtpService from '#services/otp_service'
import Registration from '#models/registration'

export default class AuthController {
  private otpService = new OtpService()

  async requestOtp({ request, response }: HttpContext) {
    const { email } = request.only(['email'])

    if (!email) {
      return response.badRequest({ message: 'Email is required' })
    }

    await this.otpService.sendOtp(email)

    return response.ok({ message: 'OTP sent' })
  }

  async verifyOtp({ request, response, auth }: HttpContext) {
    const { email, code } = request.only(['email', 'code'])

    if (!email || !code) {
      return response.badRequest({ message: 'Email and code are required' })
    }

    try {
      const user = await this.otpService.verifyOtp(email, code)
      await auth.use('web').login(user)
      return response.ok({ message: 'Logged in', user })
    } catch (error) {
      return response.unauthorized({ message: 'Invalid or expired code' })
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logged out' })
  }

  async me({ auth, response }: HttpContext) {
    await auth.use('web').authenticate()
    const user = auth.use('web').user!
    await user.load('players')
    return response.ok(user)
  }

  async myPlayers({ auth, response }: HttpContext) {
    await auth.use('web').authenticate()
    const user = auth.use('web').user!

    // Get distinct players from user's registrations
    const registrations = await Registration.query()
      .where('userId', user.id)
      .whereNot('status', 'cancelled')
      .preload('player')
      .groupBy('playerId')
      .select('playerId')

    const players = registrations.map((r) => r.player)

    return response.ok(players)
  }
}
