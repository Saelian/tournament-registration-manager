import { api } from '../../../lib/api'
import type { AdminRegistrationsResponse } from './types'

export async function fetchAdminRegistrations(): Promise<AdminRegistrationsResponse> {
  const response = await api.get<AdminRegistrationsResponse>('/admin/registrations')
  return response.data
}
