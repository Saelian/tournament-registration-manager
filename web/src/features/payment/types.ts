import type { Registration } from '../dashboard/types'

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'refund_pending'
  | 'refund_failed'
  | 'refund_requested'

export interface Payment {
  id: number
  userId: number
  helloassoCheckoutIntentId: string
  helloassoOrderId: string | null
  helloassoPaymentId: string | null
  amount: number
  status: PaymentStatus
  createdAt: string
  updatedAt: string
  registrations?: Registration[]
}

export interface RefundEligibility {
  eligible: boolean
  deadlinePassed?: boolean
  deadlineMessage?: string
  amount?: number
  registrations?: Array<{
    id: number
    tableName: string
    status: string
  }>
  error?: 'PAYMENT_NOT_FOUND' | 'NOT_OWNER' | 'INVALID_STATUS' | 'MISSING_PAYMENT_ID'
  status?: string
}

export interface CreatePaymentIntentResponse {
  paymentId: number
  redirectUrl: string
}
