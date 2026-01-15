import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { unauthorized } from '#helpers/api_response'

export default class AdminAuthMiddleware {
    async handle(ctx: HttpContext, next: NextFn) {
        try {
            await ctx.auth.authenticateUsing(['admin'])
            return next()
        } catch {
            return unauthorized(ctx)
        }
    }
}
