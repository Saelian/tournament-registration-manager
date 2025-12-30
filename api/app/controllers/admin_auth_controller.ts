import { HttpContext } from '@adonisjs/core/http'
import Admin from '#models/admin'
import { loginValidator } from '#validators/admin_auth'
import { success, error } from '#helpers/api_response'

export default class AdminAuthController {
  /**
   * Login an admin
   */
  async login(ctx: HttpContext) {
    const { auth, request } = ctx
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const admin = await Admin.verifyCredentials(email, password)
      await auth.use('admin').login(admin)

      return success(ctx, {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
      })
    } catch {
      return error(ctx, 'INVALID_CREDENTIALS', 'Invalid email or password', 401)
    }
  }

  /**
   * Logout an admin
   */
  async logout(ctx: HttpContext) {
    const { auth } = ctx
    await auth.use('admin').logout()
    return success(ctx, { message: 'Logged out successfully' })
  }

  /**
   * Get the current logged-in admin
   * Returns null with 200 status if not authenticated (avoids 401 errors on login page)
   */
  async me(ctx: HttpContext) {
    const { auth, response } = ctx
    const isAuthenticated = await auth.use('admin').check()

    if (!isAuthenticated) {
      return response.status(200).send({ status: 'success', data: null })
    }

    const admin = auth.use('admin').user!

    return success(ctx, {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
    })
  }
}
