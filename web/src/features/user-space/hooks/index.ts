import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { Registration } from '../types'
import type { Payment } from '../../payments/types'

export const USER_SPACE_KEYS = {
    all: ['user-space'] as const,
    registrations: () => [...USER_SPACE_KEYS.all, 'registrations'] as const,
    payments: () => [...USER_SPACE_KEYS.all, 'payments'] as const,
}

export function useMyRegistrations() {
    return useQuery({
        queryKey: USER_SPACE_KEYS.registrations(),
        queryFn: async () => {
            const { data } = await api.get<Registration[]>('/api/me/registrations')
            return data
        },
    })
}

export function useMyPaymentsWithRegistrations() {
    return useQuery({
        queryKey: USER_SPACE_KEYS.payments(),
        queryFn: async () => {
            const { data } = await api.get<Payment[]>('/api/me/payments')
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
            queryClient.invalidateQueries({ queryKey: USER_SPACE_KEYS.registrations() })
            queryClient.invalidateQueries({ queryKey: USER_SPACE_KEYS.payments() })
            queryClient.invalidateQueries({ queryKey: ['payments'] })
        },
    })
}
