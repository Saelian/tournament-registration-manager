import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface FilterConfig {
  key: string
  type: 'text' | 'select' | 'range' | 'boolean'
  label: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
}

export interface FilterValue {
  text?: string
  select?: string
  range?: { min?: number; max?: number }
  boolean?: boolean
}

export type FiltersState = Record<string, FilterValue>

export interface UseTableFiltersOptions<T> {
  filters?: FilterConfig[]
  persistToUrl?: boolean
  searchKeys?: (keyof T)[]
  initialFilters?: FiltersState
}

function parseUrlFilters(searchParams: URLSearchParams): { search: string; filters: FiltersState } {
  const search = searchParams.get('search') || ''
  const filters: FiltersState = {}

  searchParams.forEach((value, key) => {
    if (key.startsWith('filter.')) {
      const filterKey = key.replace('filter.', '')
      if (value.includes('-')) {
        const [min, max] = value.split('-').map((v) => (v ? Number(v) : undefined))
        filters[filterKey] = { range: { min, max } }
      } else if (value === 'true' || value === 'false') {
        filters[filterKey] = { boolean: value === 'true' }
      } else {
        filters[filterKey] = { select: value }
      }
    }
  })

  return { search, filters }
}

function filtersToUrlParams(search: string, filters: FiltersState): Record<string, string> {
  const params: Record<string, string> = {}

  if (search) {
    params.search = search
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value.select) {
      params[`filter.${key}`] = value.select
    } else if (value.range) {
      const { min, max } = value.range
      if (min !== undefined || max !== undefined) {
        params[`filter.${key}`] = `${min ?? ''}-${max ?? ''}`
      }
    } else if (value.boolean !== undefined) {
      params[`filter.${key}`] = String(value.boolean)
    }
  })

  return params
}

export function useTableFilters<T extends object>(
  data: T[],
  options: UseTableFiltersOptions<T> = {}
) {
  const {
    filters: filterConfigs = [],
    persistToUrl = false,
    searchKeys = [],
    initialFilters = {},
  } = options

  const [searchParams, setSearchParams] = useSearchParams()

  const initialState = useMemo(() => {
    if (persistToUrl) {
      return parseUrlFilters(searchParams)
    }
    return { search: '', filters: initialFilters }
  }, [])

  const [search, setSearchState] = useState(initialState.search)
  const [filters, setFiltersState] = useState<FiltersState>(initialState.filters)

  // Sync to URL when state changes
  useEffect(() => {
    if (persistToUrl) {
      const params = filtersToUrlParams(search, filters)
      const currentParams = Object.fromEntries(searchParams.entries())

      // Keep non-filter params
      const nonFilterParams: Record<string, string> = {}
      Object.entries(currentParams).forEach(([key, value]) => {
        if (!key.startsWith('filter.') && key !== 'search') {
          nonFilterParams[key] = value
        }
      })

      setSearchParams({ ...nonFilterParams, ...params }, { replace: true })
    }
  }, [search, filters, persistToUrl, setSearchParams])

  const setSearch = useCallback((value: string) => {
    setSearchState(value)
  }, [])

  const setFilter = useCallback((key: string, value: FilterValue) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const clearFilter = useCallback((key: string) => {
    setFiltersState((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchState('')
    setFiltersState({})
  }, [])

  const filteredData = useMemo(() => {
    let result = data

    // Apply search
    if (search && searchKeys.length > 0) {
      const searchLower = search.toLowerCase()
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key]
          if (value == null) return false
          return String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      const config = filterConfigs.find((f) => f.key === key)
      if (!config) return

      result = result.filter((item) => {
        const itemValue = (item as Record<string, unknown>)[key]

        if (config.type === 'select' && filterValue.select) {
          return String(itemValue) === filterValue.select
        }

        if (config.type === 'range' && filterValue.range) {
          const numValue = Number(itemValue)
          const { min, max } = filterValue.range
          if (min !== undefined && numValue < min) return false
          if (max !== undefined && numValue > max) return false
          return true
        }

        if (config.type === 'boolean' && filterValue.boolean !== undefined) {
          return Boolean(itemValue) === filterValue.boolean
        }

        return true
      })
    })

    return result
  }, [data, search, filters, searchKeys, filterConfigs])

  const hasActiveFilters = useMemo(() => {
    return search.length > 0 || Object.keys(filters).length > 0
  }, [search, filters])

  return {
    search,
    filters,
    filteredData,
    hasActiveFilters,
    setSearch,
    setFilter,
    clearFilter,
    clearAllFilters,
  }
}
