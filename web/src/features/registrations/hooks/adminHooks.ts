import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
    fetchAdminRegistrations,
    promoteRegistration,
    createAdminRegistration,
    generatePaymentLink,
    collectPayment,
    type CreateAdminRegistrationPayload,
} from '../api/adminApi'
import type { RegistrationData, AggregatedPlayerRow } from '../types'

export function useAdminRegistrations() {
    return useQuery({
        queryKey: ['admin', 'registrations'],
        queryFn: fetchAdminRegistrations,
    })
}

export function usePromoteRegistration() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: promoteRegistration,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'tables'] })
        },
    })
}

export function useCreateAdminRegistration() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateAdminRegistrationPayload) => createAdminRegistration(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'tables'] })
        },
    })
}

export function useGeneratePaymentLink() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ registrationId, email }: { registrationId: number; email?: string }) =>
            generatePaymentLink(registrationId, email),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
        },
    })
}

export function useCollectPayment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (paymentId: number) => collectPayment(paymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'tables'] })
        },
    })
}

export function aggregateByPlayer(registrations: RegistrationData[], dayFilter?: string): AggregatedPlayerRow[] {
    const filtered = dayFilter ? registrations.filter((r) => r.table.date === dayFilter) : registrations

    const byPlayer = new Map<number, AggregatedPlayerRow>()

    for (const reg of filtered) {
        const existing = byPlayer.get(reg.player.id)
        if (existing) {
            existing.tables.push(reg.table)
            existing.registrationIds.push(reg.id)
            existing.registrationStatuses[reg.table.id] = reg.status
            existing.registrationWaitlistRanks[reg.table.id] = reg.waitlistRank
            existing.registrationCheckedInAt[reg.table.id] = reg.checkedInAt
            existing.registrationIdByTableId[reg.table.id] = reg.id
            if (reg.isAdminCreated) {
                existing.hasAdminRegistration = true
            }
            if (reg.payment) {
                existing.payments.push(reg.payment)
            }
        } else {
            byPlayer.set(reg.player.id, {
                playerId: reg.player.id,
                bibNumber: reg.player.bibNumber,
                firstName: reg.player.firstName,
                lastName: reg.player.lastName,
                licence: reg.player.licence,
                points: reg.player.points,
                club: reg.player.club,
                sex: reg.player.sex,
                category: reg.player.category,
                tables: [reg.table],
                registrationStatuses: { [reg.table.id]: reg.status },
                registrationWaitlistRanks: { [reg.table.id]: reg.waitlistRank },
                registrationCheckedInAt: { [reg.table.id]: reg.checkedInAt },
                hasAdminRegistration: reg.isAdminCreated ?? false,
                subscriber: reg.subscriber,
                payments: reg.payment ? [reg.payment] : [],
                registrationIds: [reg.id],
                registrationIdByTableId: { [reg.table.id]: reg.id },
                createdAt: reg.createdAt,
            })
        }
    }

    return Array.from(byPlayer.values()).sort((a, b) => a.lastName.localeCompare(b.lastName))
}

export function useAggregatedPlayers(registrations: RegistrationData[] | undefined, dayFilter?: string) {
    return useMemo(() => {
        if (!registrations) return []
        return aggregateByPlayer(registrations, dayFilter)
    }, [registrations, dayFilter])
}
