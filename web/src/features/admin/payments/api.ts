import { api } from '../../../lib/api'
import type { AdminPaymentsResponse, ProcessRefundRequest, ProcessRefundResponse } from './types'

export interface FetchPaymentsParams {
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export async function fetchAdminPayments(
  params: FetchPaymentsParams = {}
): Promise<AdminPaymentsResponse> {
  const response = await api.get<AdminPaymentsResponse>('/admin/payments', { params })
  return response.data
}

export async function processRefund(
  paymentId: number,
  data: ProcessRefundRequest
): Promise<ProcessRefundResponse> {
  const response = await api.post<ProcessRefundResponse>(
    `/admin/payments/${paymentId}/process-refund`,
    data
  )
  return response.data
}
