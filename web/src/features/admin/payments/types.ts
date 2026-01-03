export interface SubscriberInfo {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
}

export interface PlayerInfo {
  id: number
  firstName: string
  lastName: string
  licence: string
  club: string
}

export interface TableInfo {
  id: number
  name: string
  date: string
  startTime: string
  price: number
}

export interface RegistrationDetail {
  id: number
  status: string
  createdAt: string
  player: PlayerInfo
  table: TableInfo
}

export interface PaymentData {
  id: number
  amount: number
  status: string
  createdAt: string
  refundedAt: string | null
  refundMethod: string | null
  helloassoOrderId: string | null
  subscriber: SubscriberInfo
  registrationsCount: number
  registrations: RegistrationDetail[]
}

export interface AdminPaymentsResponse {
  payments: PaymentData[]
  pendingRefunds: number
  meta: {
    total: number
    page: number
    lastPage: number
    perPage: number
  }
}

export type RefundMethod = 'helloasso_manual' | 'bank_transfer' | 'cash'

export interface ProcessRefundRequest {
  refundMethod: RefundMethod
}

export interface ProcessRefundResponse {
  id: number
  status: string
  refundedAt: string
  refundMethod: string
}
