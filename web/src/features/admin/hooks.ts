import { useMemo } from 'react'
import { useTables } from '../tables/hooks'
import { useTournament } from '../tournament/hooks'
import type { Table } from '../tables/types'

export interface AdminStats {
  totalRegistrations: number
  totalRevenue: number
  averageFillRate: number
  tablesCount: number
  totalCapacity: number
  alerts: {
    almostFullTables: Table[]
    emptyTables: Table[]
  }
}

export function useAdminStats() {
  const { data: tables, isLoading: isLoadingTables } = useTables()
  const { data: tournament, isLoading: isLoadingTournament } = useTournament()

  const stats = useMemo((): AdminStats | null => {
    if (!tables || tables.length === 0) {
      return {
        totalRegistrations: 0,
        totalRevenue: 0,
        averageFillRate: 0,
        tablesCount: 0,
        totalCapacity: 0,
        alerts: {
          almostFullTables: [],
          emptyTables: [],
        },
      }
    }

    const totalRegistrations = tables.reduce((sum, t) => sum + t.registeredCount, 0)
    const totalRevenue = tables.reduce((sum, t) => sum + t.registeredCount * t.price, 0)
    const totalCapacity = tables.reduce((sum, t) => sum + t.quota, 0)
    const averageFillRate = totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0

    // Alertes : tableaux > 80% remplis
    const almostFullTables = tables.filter((t) => {
      const fillRate = t.registeredCount / t.quota
      return fillRate >= 0.8 && fillRate < 1
    })

    // Tableaux vides
    const emptyTables = tables.filter((t) => t.registeredCount === 0)

    return {
      totalRegistrations,
      totalRevenue,
      averageFillRate,
      tablesCount: tables.length,
      totalCapacity,
      alerts: {
        almostFullTables,
        emptyTables,
      },
    }
  }, [tables])

  return {
    stats,
    tables,
    tournament,
    isLoading: isLoadingTables || isLoadingTournament,
  }
}
