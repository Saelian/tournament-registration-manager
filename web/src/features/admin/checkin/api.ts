import { api } from '../../../lib/api'
import type { CheckinDaysResponse, CheckinPlayersResponse, CheckinResponse } from './types'

export async function fetchCheckinDays(): Promise<CheckinDaysResponse> {
  const response = await api.get<CheckinDaysResponse>('/admin/checkin/days')
  return response.data
}

export async function fetchCheckinPlayers(date: string): Promise<CheckinPlayersResponse> {
  const response = await api.get<CheckinPlayersResponse>(`/admin/checkin/${date}/players`)
  return response.data
}

export async function checkinPlayer(registrationId: number): Promise<CheckinResponse> {
  const response = await api.post<CheckinResponse>(`/admin/checkin/${registrationId}`)
  return response.data
}

export async function markPlayerAbsent(registrationId: number): Promise<CheckinResponse> {
  const response = await api.post<CheckinResponse>(`/admin/checkin/${registrationId}/absent`)
  return response.data
}

export async function cancelCheckin(registrationId: number): Promise<CheckinResponse> {
  const response = await api.delete<CheckinResponse>(`/admin/checkin/${registrationId}`)
  return response.data
}
