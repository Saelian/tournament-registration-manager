import type { HttpContext } from '@adonisjs/core/http'
import OtpService from '#services/otp_service'
import { updateProfileValidator } from '#validators/auth'
import logger from '@adonisjs/core/services/logger'

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

  async logout({ auth, session, response }: HttpContext) {
    const isAuthBefore = await auth.use('web').check()
    const sessionIdBefore = session.sessionId
    logger.info(`Logout - before: isAuth=${isAuthBefore}, sessionId=${sessionIdBefore}`)

    await auth.use('web').logout()

    const isAuthAfter = await auth.use('web').check()
    const sessionIdAfter = session.sessionId
    logger.info(`Logout - after: isAuth=${isAuthAfter}, sessionId=${sessionIdAfter}`)

    return response.ok({ message: 'Logged out' })
  }

  async me({ auth, session, response }: HttpContext) {
    const isAuthenticated = await auth.use('web').check()
    logger.info(`Me - check: isAuth=${isAuthenticated}, sessionId=${session.sessionId}`)
    if (!isAuthenticated) {
      return response.ok({ status: 'success', data: null })
    }
    const user = auth.use('web').user!
    await user.load('players')
    return response.ok({
      status: 'success',
      data: {
        ...user.serialize(),
        isProfileComplete: user.isProfileComplete,
      },
    })
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    await auth.use('web').authenticate()
    const user = auth.use('web').user!

    const data = await request.validateUsing(updateProfileValidator)

    user.firstName = data.firstName
    user.lastName = data.lastName
    user.phone = data.phone
    await user.save()

    return response.ok({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    })
  }

  async myPlayers({ auth, response }: HttpContext) {
    await auth.use('web').authenticate()
    const user = auth.use('web').user!

    // Get players directly linked to this user
    await user.load('players')

    return response.ok(user.players)
  }
}
