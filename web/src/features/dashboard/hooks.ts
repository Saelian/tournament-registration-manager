import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Registration } from './types'

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  registrations: () => [...DASHBOARD_KEYS.all, 'registrations'] as const,
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.registrations(),
    queryFn: async () => {
      const { data } = await api.get<Registration[]>('/api/me/registrations')
      return data
    },
  })
}

export function useCancelRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/registrations/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.registrations() })
    },
  })
}
