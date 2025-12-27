import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Player } from './types'

export function usePlayerSearch() {
  return useMutation({
    mutationFn: async (licence: string) => {
      const { data } = await api.get<Player>('/api/players/search', {
        params: { licence },
      })
      return data
    },
  })
}

export function useLinkPlayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (player: Player) => {
      const { data } = await api.post<Player>('/api/players/link', player)
      return data
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    }
  })
}
