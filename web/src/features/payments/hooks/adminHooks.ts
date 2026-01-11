import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminPayments,
  processRefund,
  collectPayment,
  regeneratePaymentLink,
  type FetchPaymentsParams,
} from '../api/adminApi'
import type { RefundMethod } from '../types'

export function useAdminPayments(params: FetchPaymentsParams = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => fetchAdminPayments(params),
  })
}

export function useProcessRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentId, refundMethod }: { paymentId: number; refundMethod: RefundMethod }) =>
      processRefund(paymentId, { refundMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
    },
  })
}

export function useCollectPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentId: number) => collectPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
    },
  })
}

export function useRegeneratePaymentLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (registrationId: number) => regeneratePaymentLink(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
    },
  })
}
