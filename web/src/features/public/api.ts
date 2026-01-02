import { api } from '../../lib/api'
import type { PublicRegistrationsResponse } from './types'

export interface FetchPublicRegistrationsParams {
  tableId?: number
}

export async function fetchPublicRegistrations(
  params?: FetchPublicRegistrationsParams
): Promise<PublicRegistrationsResponse> {
  const response = await api.get<PublicRegistrationsResponse>('/api/registrations/public', {
    params,
  })
  return response.data
}
