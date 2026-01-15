import axios, { AxiosError, type AxiosResponse } from 'axios'

/**
 * API response types matching backend format
 */
export interface ApiSuccessResponse<T> {
    status: 'success'
    data: T
}

export interface ApiErrorResponse {
    status: 'error'
    code: string
    message: string
    errors?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    code: string
    status: number
    errors?: Record<string, string[]>
    data?: unknown

    constructor(code: string, message: string, status: number, errors?: Record<string, string[]>, data?: unknown) {
        super(message)
        this.name = 'ApiError'
        this.code = code
        this.status = status
        this.errors = errors
        this.data = data
    }
}

/**
 * Axios instance configured for the API
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Response interceptor to handle standardized API responses
 */
api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        // Unwrap successful responses
        if (response.data.status === 'success') {
            return {
                ...response,
                data: response.data.data,
            }
        }
        return response
    },
    (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.data) {
            const { code, message, errors } = error.response.data
            throw new ApiError(code, message, error.response.status, errors, error.response.data)
        }

        // Network or other errors
        throw new ApiError('NETWORK_ERROR', error.message || 'Network error', 0)
    }
)

/**
 * Helper to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
}
