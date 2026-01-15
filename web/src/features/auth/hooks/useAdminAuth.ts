import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { Admin, LoginFormData } from '../types'

export const AUTH_KEY = ['auth', 'me']

export function useCurrentAdmin() {
    // Only fetch on admin pages to avoid 401 errors on public pages
    const isAdminPage = window.location.pathname.startsWith('/admin')

    return useQuery({
        queryKey: AUTH_KEY,
        queryFn: async () => {
            const { data } = await api.get<Admin>('/admin/me')
            return data
        },
        retry: false,
        staleTime: Infinity,
        enabled: isAdminPage,
    })
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: LoginFormData) => {
            const { data: result } = await api.post<Admin>('/admin/login', data)
            return result
        },
        onSuccess: (data) => {
            queryClient.setQueryData(AUTH_KEY, data)
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            await api.post('/admin/logout')
        },
        onSuccess: () => {
            queryClient.setQueryData(AUTH_KEY, null)
            queryClient.clear()
            window.location.href = '/'
        },
    })
}
