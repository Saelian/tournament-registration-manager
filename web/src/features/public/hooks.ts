import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Tournament } from '../tournament/types'
import type { Table, EligibleTable } from '../tables/types'
import { fetchPublicRegistrations } from './api'

export function usePublicTournaments() {
  return useQuery({
    queryKey: ['public', 'tournaments'],
    queryFn: async () => {
      const { data } = await api.get<Tournament[]>('/tournaments')
      return data
    },
  })
}

export function usePublicTables(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['public', 'tournaments', tournamentId, 'tables'],
    queryFn: async () => {
      if (!tournamentId) return []
      const { data } = await api.get<Table[]>(`/tournaments/${tournamentId}/tables`)
      return data
    },
    enabled: !!tournamentId,
  })
}

export function useEligibleTables(playerId: number | undefined) {
  return useQuery({
    queryKey: ['tables', 'eligible', playerId],
    queryFn: async () => {
      if (!playerId) return []
      const { data } = await api.get<EligibleTable[]>('/api/tables/eligible', {
        params: { player_id: playerId },
      })
      return data
    },
    enabled: !!playerId,
  })
}

interface PublicSponsor {
  id: number
  name: string
  websiteUrl: string | null
  description: string | null
  isGlobal: boolean
}

export function usePublicSponsors(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['public', 'tournaments', tournamentId, 'sponsors'],
    queryFn: async () => {
      if (!tournamentId) return []
      const { data } = await api.get<PublicSponsor[]>(`/tournaments/${tournamentId}/sponsors`)
      return data
    },
    enabled: !!tournamentId,
  })
}

export function usePublicRegistrations(tableId?: number) {
  return useQuery({
    queryKey: ['public', 'registrations', tableId ?? 'all'],
    queryFn: () => fetchPublicRegistrations(tableId ? { tableId } : undefined),
  })
}
