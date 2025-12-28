import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are disabled for API mode
   */
  protected renderStatusPages = false

  /**
   * The method is used for handling errors and returning
   * response to the client in standardized format
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Handle VineJS validation errors
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: error.messages,
      })
    }

    // Handle database errors (hide SQL details in production)
    if (this.isDatabaseError(error)) {
      const message = this.debug ? (error as Error).message : 'Database error'
      return ctx.response.status(500).json({
        status: 'error',
        code: 'DATABASE_ERROR',
        message,
      })
    }

    // Handle known HTTP errors
    if (error instanceof Error && 'status' in error) {
      const httpError = error as Error & { status: number; code?: string }
      const status = httpError.status || 500
      const code = httpError.code || this.getErrorCode(status)

      // Hide detailed messages for 500 errors in production
      const message =
        status >= 500 && !this.debug
          ? 'An error occurred'
          : httpError.message || 'An error occurred'

      return ctx.response.status(status).json({
        status: 'error',
        code,
        message,
      })
    }

    // Handle unknown errors
    const message = this.debug && error instanceof Error ? error.message : 'Internal server error'

    return ctx.response.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message,
    })
  }

  /**
   * Check if error is a database error (contains SQL or has DB error codes)
   */
  private isDatabaseError(error: unknown): boolean {
    if (!(error instanceof Error)) return false

    // Check for PostgreSQL error codes (numeric strings like '23502', '42P01')
    const pgError = error as Error & { code?: string }
    if (pgError.code && /^[0-9A-Z]{5}$/.test(pgError.code)) {
      return true
    }

    // Check for SQL-like patterns in error message
    const sqlPatterns = [
      /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i,
      /\bcolumn\b.*\bdoes not exist\b/i,
      /\brelation\b.*\bdoes not exist\b/i,
      /\btable\b.*\bdoes not exist\b/i,
    ]

    return sqlPatterns.some((pattern) => pattern.test(error.message))
  }

  /**
   * Get error code from HTTP status
   */
  private getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    }
    return codes[status] || 'ERROR'
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
