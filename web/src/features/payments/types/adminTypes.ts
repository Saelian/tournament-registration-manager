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
  paymentMethod: string
  createdAt: string
  refundedAt: string | null
  refundMethod: string | null
  helloassoOrderId: string | null
  subscriber: SubscriberInfo
  registrationsCount: number
  registrations: RegistrationDetail[]
}

export interface PartialRefund {
  registrationId: number
  paymentId: number | null
  originalPaymentMethod: string | null
  playerId: number
  playerName: string
  playerLicence: string
  tableName: string
  amountCents: number
  cancelledAt: string
  cancelledByAdminName: string | null
  refundStatus: 'requested' | 'done'
  refundMethod: 'bank_transfer' | 'cash' | null
  refundedAt: string | null
  subscriber: {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
  }
}

/** @deprecated use PartialRefund */
export type PendingPartialRefund = PartialRefund

export interface AdminPaymentsResponse {
  payments: PaymentData[]
  pendingRefunds: number
  partialRefunds: PartialRefund[]
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
