import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminPayments, processRefund, type FetchPaymentsParams } from './api'
import type { RefundMethod } from './types'

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
