import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { Tournament, TournamentFormData } from '../types'

const TOURNAMENT_KEY = ['tournament']

export function useTournament() {
    return useQuery({
        queryKey: TOURNAMENT_KEY,
        queryFn: async () => {
            const { data } = await api.get<Tournament>('/admin/tournament')
            return data
        },
        retry: (failureCount, error) => {
            // Don't retry on 404 (tournament not configured yet)
            if (error && 'status' in error && error.status === 404) {
                return false
            }
            return failureCount < 1
        },
    })
}

export function useUpdateTournament() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: TournamentFormData) => {
            const { data: result } = await api.put<Tournament>('/admin/tournament', data)
            return result
        },
        onSuccess: (data) => {
            queryClient.setQueryData(TOURNAMENT_KEY, data)
        },
    })
}
