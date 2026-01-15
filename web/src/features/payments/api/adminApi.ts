import { api } from '../../../lib/api'
import type { AdminPaymentsResponse, ProcessRefundRequest, ProcessRefundResponse } from '../types'

export interface FetchPaymentsParams {
    status?: string
    paymentMethod?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}

export async function fetchAdminPayments(params: FetchPaymentsParams = {}): Promise<AdminPaymentsResponse> {
    const response = await api.get<AdminPaymentsResponse>('/admin/payments', { params })
    return response.data
}

export async function processRefund(paymentId: number, data: ProcessRefundRequest): Promise<ProcessRefundResponse> {
    const response = await api.post<ProcessRefundResponse>(`/admin/payments/${paymentId}/process-refund`, data)
    return response.data
}

export interface CollectPaymentResponse {
    id: number
    status: string
    paymentMethod: string
    registrations: Array<{ id: number; status: string }>
}

export async function collectPayment(paymentId: number): Promise<CollectPaymentResponse> {
    const response = await api.patch<CollectPaymentResponse>(`/admin/payments/${paymentId}/collect`)
    return response.data
}

export interface RegeneratePaymentLinkResponse {
    checkoutUrl: string
    payment: {
        id: number
        amount: number
        status: string
    }
}

export async function regeneratePaymentLink(registrationId: number): Promise<RegeneratePaymentLinkResponse> {
    const response = await api.post<RegeneratePaymentLinkResponse>(
        `/admin/registrations/${registrationId}/generate-payment-link`
    )
    return response.data
}
