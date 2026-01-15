import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { Player, CreateRegistrationsResponse } from '../types'
import { USER_SPACE_KEYS } from '../../user-space/hooks'

export function useMyPlayers(enabled = true) {
    return useQuery({
        queryKey: ['auth', 'me', 'players'],
        queryFn: async () => {
            const { data } = await api.get<Player[]>('/auth/me/players')
            return data
        },
        enabled,
        retry: false,
    })
}

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
        },
    })
}

export function useFindOrCreatePlayer() {
    return useMutation({
        mutationFn: async (player: Player) => {
            const { data } = await api.post<Player>('/api/players/find-or-create', player)
            return data
        },
    })
}

export function useCreateRegistrations() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            playerId,
            tableIds,
            initiatePayment = true,
        }: {
            playerId: number
            tableIds: number[]
            initiatePayment?: boolean
        }) => {
            const { data } = await api.post<CreateRegistrationsResponse>('/api/registrations', {
                playerId,
                tableIds,
                initiatePayment,
            })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables', 'eligible'] })
            queryClient.invalidateQueries({ queryKey: USER_SPACE_KEYS.registrations() })
        },
    })
}
