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

    // Collect payments from new array or legacy single object
    const currentPayments = reg.payments && reg.payments.length > 0 ? reg.payments : reg.payment ? [reg.payment] : []

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
      if (currentPayments.length > 0) {
        existing.payments.push(...currentPayments)
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
        payments: currentPayments,
        registrationIds: [reg.id],
        registrationIdByTableId: { [reg.table.id]: reg.id },
        createdAt: reg.createdAt,
        registrationGroups: [], // Will be populated below
      })
    }
  }

  // Build registration groups for each player
  for (const player of byPlayer.values()) {
    const playerRegistrations = filtered.filter((r) => r.player.id === player.playerId)
    player.registrationGroups = buildRegistrationGroups(playerRegistrations)
  }

  return Array.from(byPlayer.values()).sort((a, b) => a.lastName.localeCompare(b.lastName))
}

/**
 * Groupe les inscriptions d'un joueur par inscripteur (subscriber.id).
 * Chaque groupe représente une "session d'inscription" faite par une personne.
 */
function buildRegistrationGroups(registrations: RegistrationData[]): import('../types').RegistrationGroup[] {
  // Grouper par subscriber.id
  const bySubscriber = new Map<number, RegistrationData[]>()

  for (const reg of registrations) {
    const subscriberId = reg.subscriber.id
    const existing = bySubscriber.get(subscriberId)
    if (existing) {
      existing.push(reg)
    } else {
      bySubscriber.set(subscriberId, [reg])
    }
  }

  const groups: import('../types').RegistrationGroup[] = []

  for (const regs of bySubscriber.values()) {
    // Trier par date de création pour avoir un ordre cohérent
    regs.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    // Le premier registration détermine les infos du groupe
    const firstReg = regs[0]

    // Trouver le paiement réussi associé (prendre le plus récent)
    const successfulPayment =
      regs
        .flatMap((r) => r.payments)
        .filter((p) => p && p.status === 'succeeded')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null

    groups.push({
      groupId: `group-${firstReg.subscriber.id}-${firstReg.id}`,
      isAdminCreated: regs.some((r) => r.isAdminCreated),
      createdByAdmin: regs.find((r) => r.createdByAdmin)?.createdByAdmin ?? null,
      subscriber: firstReg.subscriber,
      tables: regs.map((r) => ({
        ...r.table,
        registrationId: r.id,
        status: r.status,
        checkedInAt: r.checkedInAt,
        waitlistRank: r.waitlistRank,
      })),
      payment: successfulPayment,
      createdAt: firstReg.createdAt,
    })
  }

  // Trier les groupes par date de création
  return groups.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function useAggregatedPlayers(registrations: RegistrationData[] | undefined, dayFilter?: string) {
  return useMemo(() => {
    if (!registrations) return []
    return aggregateByPlayer(registrations, dayFilter)
  }, [registrations, dayFilter])
}
