import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { Tournament } from '../types'

export function usePublicTournaments() {
  return useQuery({
    queryKey: ['public', 'tournaments'],
    queryFn: async () => {
      const { data } = await api.get<Tournament[]>('/tournaments')
      return data
    },
  })
}

export interface PublicSponsor {
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
