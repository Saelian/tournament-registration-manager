import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Payment, CreatePaymentIntentResponse, RefundEligibility } from './types'
import { DASHBOARD_KEYS } from '../dashboard/hooks'

export function useCreatePaymentIntent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (registrationIds: number[]) => {
      const { data } = await api.post<CreatePaymentIntentResponse>('/api/payments/create-intent', {
        registrationIds,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function usePayment(paymentId: number | null) {
  return useQuery({
    queryKey: ['payments', paymentId],
    queryFn: async () => {
      const { data } = await api.get<Payment>(`/api/payments/${paymentId}`)
      return data
    },
    enabled: !!paymentId,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'pending') {
        return 3000
      }
      return false
    },
  })
}

export function useMyPayments() {
  return useQuery({
    queryKey: ['payments', 'me'],
    queryFn: async () => {
      const { data } = await api.get<Payment[]>('/api/me/payments')
      return data
    },
  })
}

export function useRefundEligibility(paymentId: number | null) {
  return useQuery({
    queryKey: ['payments', paymentId, 'refund-eligibility'],
    queryFn: async () => {
      const { data } = await api.get<RefundEligibility>(`/api/payments/${paymentId}/refund-eligibility`)
      return data
    },
    enabled: !!paymentId,
  })
}

export function useRequestRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (paymentId: number) => {
      await api.post(`/api/payments/${paymentId}/refund`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.registrations() })
    },
  })
}
