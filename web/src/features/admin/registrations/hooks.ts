import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchAdminRegistrations, fetchTableRegistrations } from './api'
import type { RegistrationData, AggregatedPlayerRow } from './types'

export function useAdminRegistrations() {
  return useQuery({
    queryKey: ['admin', 'registrations'],
    queryFn: fetchAdminRegistrations,
  })
}

export function useTableRegistrations(tableId: number) {
  return useQuery({
    queryKey: ['admin', 'tables', tableId, 'registrations'],
    queryFn: () => fetchTableRegistrations(tableId),
  })
}

export function aggregateByPlayer(
  registrations: RegistrationData[],
  dayFilter?: string
): AggregatedPlayerRow[] {
  const filtered = dayFilter
    ? registrations.filter((r) => r.table.date === dayFilter)
    : registrations

  const byPlayer = new Map<number, AggregatedPlayerRow>()

  for (const reg of filtered) {
    const existing = byPlayer.get(reg.player.id)
    if (existing) {
      existing.tables.push(reg.table)
      existing.registrationIds.push(reg.id)
      existing.registrationStatuses[reg.table.id] = reg.status
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
        subscriber: reg.subscriber,
        payments: reg.payment ? [reg.payment] : [],
        registrationIds: [reg.id],
        createdAt: reg.createdAt,
      })
    }
  }

  return Array.from(byPlayer.values()).sort((a, b) => a.lastName.localeCompare(b.lastName))
}

export function useAggregatedPlayers(
  registrations: RegistrationData[] | undefined,
  dayFilter?: string
) {
  return useMemo(() => {
    if (!registrations) return []
    return aggregateByPlayer(registrations, dayFilter)
  }, [registrations, dayFilter])
}
