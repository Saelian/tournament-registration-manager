import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@lib/api'
import type { Sponsor, SponsorFormData } from '../types'

const SPONSORS_KEY = ['sponsors']

export function useSponsors() {
    return useQuery({
        queryKey: SPONSORS_KEY,
        queryFn: async () => {
            const { data } = await api.get<Sponsor[]>('/admin/sponsors')
            return data
        },
    })
}

export function useSponsor(id: number | null) {
    return useQuery({
        queryKey: [...SPONSORS_KEY, id],
        queryFn: async () => {
            if (!id) return null
            const { data } = await api.get<Sponsor>(`/admin/sponsors/${id}`)
            return data
        },
        enabled: !!id,
    })
}

export function useCreateSponsor() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: SponsorFormData) => {
            const { data: result } = await api.post<Sponsor>('/admin/sponsors', data)
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SPONSORS_KEY })
        },
    })
}

export function useUpdateSponsor() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: SponsorFormData }) => {
            const { data: result } = await api.put<Sponsor>(`/admin/sponsors/${id}`, data)
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SPONSORS_KEY })
        },
    })
}

export function useDeleteSponsor() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/admin/sponsors/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SPONSORS_KEY })
        },
    })
}
