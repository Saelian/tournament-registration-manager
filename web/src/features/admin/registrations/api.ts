import { api } from '../../../lib/api'
import type { AdminRegistrationsResponse } from './types'

export async function fetchAdminRegistrations(): Promise<AdminRegistrationsResponse> {
  const response = await api.get<AdminRegistrationsResponse>('/admin/registrations')
  return response.data
}

export async function promoteRegistration(
  registrationId: number
): Promise<{ message: string; registration: { id: number; status: string; waitlistRank: null } }> {
  const response = await api.post<{
    message: string
    registration: { id: number; status: string; waitlistRank: null }
  }>(`/admin/registrations/${registrationId}/promote`)
  return response.data
}
