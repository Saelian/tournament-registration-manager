import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { User, RequestOtpFormData, VerifyOtpFormData, ProfileFormData } from './types'

export const USER_AUTH_KEY = ['auth', 'user', 'me']

export function useCurrentUser() {
  return useQuery({
    queryKey: USER_AUTH_KEY,
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me')
      return data
    },
    retry: false,
    staleTime: Infinity,
  })
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: async (data: RequestOtpFormData) => {
      await api.post('/auth/request-otp', data)
    },
  })
}

export function useVerifyOtp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: VerifyOtpFormData) => {
      const { data: result } = await api.post<{ user: User }>('/auth/verify-otp', data)
      return result.user
    },
    onSuccess: (user) => {
      queryClient.setQueryData(USER_AUTH_KEY, user)
    },
  })
}

export function useUserLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(USER_AUTH_KEY, null)
      window.location.href = '/'
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Note: the response is already unwrapped by the axios interceptor
      const { data: updatedUser } = await api.patch<User>('/auth/user/profile', data)
      return updatedUser
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_AUTH_KEY, (oldUser: User | undefined) => {
        if (!oldUser) return updatedUser
        return {
          ...oldUser,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          isProfileComplete: true,
        }
      })
    },
  })
}
