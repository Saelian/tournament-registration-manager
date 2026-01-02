import { api } from '../../../lib/api'
import type { AdminRegistrationsResponse, TableRegistrationsResponse } from './types'

export async function fetchAdminRegistrations(): Promise<AdminRegistrationsResponse> {
  const response = await api.get<AdminRegistrationsResponse>('/admin/registrations')
  return response.data
}

export async function fetchTableRegistrations(
  tableId: number
): Promise<TableRegistrationsResponse> {
  const response = await api.get<TableRegistrationsResponse>(
    `/admin/tables/${tableId}/registrations`
  )
  return response.data
}
