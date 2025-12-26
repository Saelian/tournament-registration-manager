import { HttpContext } from '@adonisjs/core/http'

/**
 * Standardized API response format
 *
 * Success: { status: "success", data: T }
 * Error: { status: "error", code: string, message: string }
 */

export interface ApiSuccessResponse<T> {
  status: 'success'
  data: T
}

export interface ApiErrorResponse {
  status: 'error'
  code: string
  message: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Send a success response
 */
export function success<T>(ctx: HttpContext, data: T, statusCode = 200): void {
  ctx.response.status(statusCode).json({
    status: 'success',
    data,
  } satisfies ApiSuccessResponse<T>)
}

/**
 * Send an error response
 */
export function error(
  ctx: HttpContext,
  code: string,
  message: string,
  statusCode = 400
): void {
  ctx.response.status(statusCode).json({
    status: 'error',
    code,
    message,
  } satisfies ApiErrorResponse)
}

/**
 * Send a created response (201)
 */
export function created<T>(ctx: HttpContext, data: T): void {
  success(ctx, data, 201)
}

/**
 * Send a not found error (404)
 */
export function notFound(ctx: HttpContext, message = 'Resource not found'): void {
  error(ctx, 'NOT_FOUND', message, 404)
}

/**
 * Send an unauthorized error (401)
 */
export function unauthorized(ctx: HttpContext, message = 'Unauthorized'): void {
  error(ctx, 'UNAUTHORIZED', message, 401)
}

/**
 * Send a forbidden error (403)
 */
export function forbidden(ctx: HttpContext, message = 'Forbidden'): void {
  error(ctx, 'FORBIDDEN', message, 403)
}

/**
 * Send a bad request error (400)
 */
export function badRequest(ctx: HttpContext, message = 'Bad Request'): void {
  error(ctx, 'BAD_REQUEST', message, 400)
}

/**
 * Send an internal server error (500)
 */
export function serverError(ctx: HttpContext, message = 'Internal server error'): void {
  error(ctx, 'INTERNAL_ERROR', message, 500)
}
