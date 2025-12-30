import type { Registration } from '../registration/types'

export interface Payment {
  id: number
  userId: number
  helloassoCheckoutIntentId: string
  helloassoOrderId: string | null
  amount: number
  status: 'pending' | 'succeeded' | 'failed' | 'expired' | 'refunded'
  createdAt: string
  updatedAt: string
  registrations?: Registration[]
}

export interface CreatePaymentIntentResponse {
  paymentId: number
  redirectUrl: string
}
