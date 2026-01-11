import { useState, useMemo } from 'react'
import { usePublicTables, useEligibleTables, usePublicTournaments } from './hooks'
import type { Player } from '../registration/types'
import type { EligibleTable } from '../tables/types'

export function useTableListLogic(tournamentId: string | undefined) {
  // Local state
  const [player, setPlayer] = useState<Player | null>(null)
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showRegistered, setShowRegistered] = useState(true)
  const [showEligibleOnly, setShowEligibleOnly] = useState(true)

  // Queries
  const { data: tournaments } = usePublicTournaments()
  const tournament = tournaments?.find((t) => t.id.toString() === tournamentId)
  const { data: publicTables, isLoading: isLoadingPublic } = usePublicTables(tournamentId)
  const { data: eligibleTables, isLoading: isLoadingEligible } = useEligibleTables(player?.id)

  // Registration period
  const registrationStatus = tournament?.registrationStatus
  const isRegistrationOpen = registrationStatus?.isOpen ?? true

  // Determine which tables to display
  const tables = player?.id ? eligibleTables : publicTables
  const isLoading = isLoadingPublic || (player?.id && isLoadingEligible)

  // Calculate occupied time slots by current selection
  const selectedTimeSlots = useMemo(() => {
    if (!eligibleTables) return new Set<string>()
    const slots = new Set<string>()
    for (const tableId of selectedTableIds) {
      const table = eligibleTables.find((t) => t.id === tableId)
      if (table) {
        slots.add(`${table.date}|${table.startTime}`)
      }
    }
    return slots
  }, [eligibleTables, selectedTableIds])

  // Count non-special tables per day (existing registrations + selection)
  const nonSpecialCountByDay = useMemo(() => {
    if (!eligibleTables) return new Map<string, number>()
    const countByDay = new Map<string, number>()

    // Count existing registrations (tables with ALREADY_REGISTERED)
    for (const table of eligibleTables) {
      if (!table.isSpecial && table.ineligibilityReasons?.includes('ALREADY_REGISTERED')) {
        const currentCount = countByDay.get(table.date) || 0
        countByDay.set(table.date, currentCount + 1)
      }
    }

    // Add selected tables in cart
    for (const tableId of selectedTableIds) {
      const table = eligibleTables.find((t) => t.id === tableId)
      if (table && !table.isSpecial) {
        const currentCount = countByDay.get(table.date) || 0
        countByDay.set(table.date, currentCount + 1)
      }
    }
    return countByDay
  }, [eligibleTables, selectedTableIds])

  const selectedTables = useMemo(() => {
    if (!eligibleTables) return []
    return eligibleTables.filter((t) => selectedTableIds.includes(t.id))
  }, [eligibleTables, selectedTableIds])

  // Calculate dynamic bottom padding to prevent cart from hiding content
  const cartPaddingBottom = useMemo(() => {
    if (selectedTableIds.length === 0) return 'pb-6'
    const tableListHeight = Math.min(selectedTableIds.length * 44, 160)
    const totalHeight = 180 + tableListHeight + 40
    if (totalHeight <= 240) return 'pb-60'
    if (totalHeight <= 288) return 'pb-72'
    if (totalHeight <= 320) return 'pb-80'
    return 'pb-96'
  }, [selectedTableIds.length])

  const filteredTables = useMemo(() => {
    if (!tables) return []
    if (!player) return tables // No filter if no player selected
    return tables.filter((table) => {
      const eligibleTable = table as EligibleTable
      const isAlreadyRegistered = eligibleTable.ineligibilityReasons?.includes('ALREADY_REGISTERED')
      if (!showRegistered && isAlreadyRegistered) return false
      if (showEligibleOnly && !eligibleTable.isEligible) return false
      return true
    })
  }, [tables, player, showRegistered, showEligibleOnly])

  // Check if a table is blocked by current selection (time conflict)
  const isBlockedByTimeConflict = (table: EligibleTable): boolean => {
    if (selectedTableIds.includes(table.id)) return false
    const timeSlot = `${table.date}|${table.startTime}`
    return selectedTimeSlots.has(timeSlot)
  }

  // Check if a table is blocked by daily limit (max 2 non-special per day)
  const isBlockedByDailyLimit = (table: EligibleTable): boolean => {
    if (selectedTableIds.includes(table.id)) return false
    if (table.isSpecial) return false
    const dailyCount = nonSpecialCountByDay.get(table.date) || 0
    return dailyCount >= 2
  }

  const handlePlayerSelect = (selectedPlayer: Player) => {
    setPlayer(selectedPlayer)
    setSelectedTableIds([])
    setError(null)
  }

  const handlePlayerClear = () => {
    setPlayer(null)
    setSelectedTableIds([])
    setError(null)
  }

  const handleToggle = (tableId: number) => {
    setSelectedTableIds((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    )
    setError(null)
  }

  const handleRemove = (tableId: number) => {
    setSelectedTableIds((prev) => prev.filter((id) => id !== tableId))
    setError(null)
  }

  return {
    player,
    selectedTableIds,
    error,
    setError,
    showRegistered,
    setShowRegistered,
    showEligibleOnly,
    setShowEligibleOnly,
    tournament,
    isLoading,
    registrationStatus,
    isRegistrationOpen,
    tables, // exposed for length check
    filteredTables,
    selectedTables,
    cartPaddingBottom,
    isBlockedByTimeConflict,
    isBlockedByDailyLimit,
    handlePlayerSelect,
    handlePlayerClear,
    handleToggle,
    handleRemove,
  }
}
