import { api } from '../../../lib/api'
import type { AdminRegistrationsResponse } from '../types/adminTypes'

export async function fetchAdminRegistrations(): Promise<AdminRegistrationsResponse> {
  const response = await api.get<AdminRegistrationsResponse>('/admin/registrations')
  return response.data
}

export async function promoteRegistration(
  registrationId: number
): Promise<{ message: string; registration: { id: number; status: string; waitlistRank: null } }> {
  const response = await api.post<{
    message: string
    registration: { id: number; status: string; waitlistRank: null }
  }>(`/admin/registrations/${registrationId}/promote`)
  return response.data
}

export interface CreateAdminRegistrationPayload {
  licence: string
  tableIds: number[]
  paymentMethod: 'helloasso' | 'cash' | 'check' | 'card'
  bypassRules?: boolean
  collected?: boolean
}

export interface CreateAdminRegistrationResponse {
  message: string
  registrations: Array<{ id: number; status: string; tableId: number }>
  payment: {
    id: number
    status: string
    amount: number
    paymentMethod: string
  }
  checkoutUrl?: string
}

export async function createAdminRegistration(
  payload: CreateAdminRegistrationPayload
): Promise<CreateAdminRegistrationResponse> {
  const response = await api.post<CreateAdminRegistrationResponse>('/admin/registrations', payload)
  return response.data
}

export interface GeneratePaymentLinkResponse {
  checkoutUrl: string
  payment: {
    id: number
    amount: number
    status: string
  }
}

export async function generatePaymentLink(
  registrationId: number,
  email?: string
): Promise<GeneratePaymentLinkResponse> {
  const response = await api.post<GeneratePaymentLinkResponse>(
    `/admin/registrations/${registrationId}/generate-payment-link`,
    { email }
  )
  return response.data
}

export interface CollectPaymentResponse {
  id: number
  status: string
  paymentMethod: string
  registrations: Array<{ id: number; status: string }>
}

export async function collectPayment(paymentId: number): Promise<CollectPaymentResponse> {
  const response = await api.patch<CollectPaymentResponse>(`/admin/payments/${paymentId}/collect`)
  return response.data
}

export interface AdminCancelPayload {
  refundStatus: 'none' | 'requested' | 'done'
  refundMethod?: 'helloasso_manual' | 'bank_transfer' | 'cash'
}

export async function adminCancelRegistration(
  registrationId: number,
  payload: AdminCancelPayload
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/admin/registrations/${registrationId}`,
    { data: payload }
  )
  return response.data
}

export async function adminCancelAllRegistrations(
  playerId: number,
  payload: AdminCancelPayload
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/admin/registrations/player/${playerId}`,
    { data: payload }
  )
  return response.data
}
