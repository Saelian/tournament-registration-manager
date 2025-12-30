import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Tournament } from '../tournament/types'
import type { Table, EligibleTable } from '../tables/types'

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
