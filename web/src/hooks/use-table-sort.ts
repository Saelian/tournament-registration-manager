import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  direction: SortDirection
}

export interface UseTableSortOptions<T> {
  initialSort?: SortState
  onSortChange?: (sort: SortState) => void
  customSortFn?: (a: T, b: T, column: string, direction: SortDirection) => number
}

export function useTableSort<T extends object>(
  data: T[],
  options: UseTableSortOptions<T> = {}
) {
  const { initialSort = { column: null, direction: null }, onSortChange, customSortFn } = options

  const [sortState, setSortState] = useState<SortState>(initialSort)

  const toggleSort = useCallback(
    (column: string) => {
      setSortState((prev) => {
        let newDirection: SortDirection
        if (prev.column !== column) {
          newDirection = 'asc'
        } else if (prev.direction === 'asc') {
          newDirection = 'desc'
        } else if (prev.direction === 'desc') {
          newDirection = null
        } else {
          newDirection = 'asc'
        }

        const newState: SortState = {
          column: newDirection ? column : null,
          direction: newDirection,
        }

        onSortChange?.(newState)
        return newState
      })
    },
    [onSortChange]
  )

  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return data
    }

    return [...data].sort((a, b) => {
      if (customSortFn) {
        return customSortFn(a, b, sortState.column!, sortState.direction)
      }

      const aValue = (a as Record<string, unknown>)[sortState.column!]
      const bValue = (b as Record<string, unknown>)[sortState.column!]

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortState.direction === 'asc' ? 1 : -1
      if (bValue == null) return sortState.direction === 'asc' ? -1 : 1

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        const diff = aValue.getTime() - bValue.getTime()
        return sortState.direction === 'asc' ? diff : -diff
      }

      // Handle strings (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'fr', { sensitivity: 'base' })
        return sortState.direction === 'asc' ? comparison : -comparison
      }

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const diff = aValue - bValue
        return sortState.direction === 'asc' ? diff : -diff
      }

      // Fallback to string comparison
      const aStr = String(aValue)
      const bStr = String(bValue)
      const comparison = aStr.localeCompare(bStr, 'fr')
      return sortState.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sortState, customSortFn])

  const resetSort = useCallback(() => {
    const newState = { column: null, direction: null }
    setSortState(newState)
    onSortChange?.(newState)
  }, [onSortChange])

  return {
    sortState,
    sortedData,
    toggleSort,
    resetSort,
    setSortState,
  }
}
