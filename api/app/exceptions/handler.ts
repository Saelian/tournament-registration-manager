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

    // Handle known HTTP errors
    if (error instanceof Error && 'status' in error) {
      const httpError = error as Error & { status: number; code?: string }
      const status = httpError.status || 500
      const code = httpError.code || this.getErrorCode(status)

      return ctx.response.status(status).json({
        status: 'error',
        code,
        message: httpError.message || 'An error occurred',
      })
    }

    // Handle unknown errors
    let message = this.debug && error instanceof Error ? error.message : 'Internal server error'
    
    // Sanitize SQL errors to avoid leaking queries to the client
    if (message.includes('insert into') || message.includes('select *') || message.includes('update "')) {
       message = 'A database error occurred.'
    }

    return ctx.response.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message,
    })
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
