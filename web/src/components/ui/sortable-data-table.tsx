import { useMemo, useState, useEffect, useRef } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown, X } from 'lucide-react'
import { cn } from '@lib/utils'
import { useTableSort, type SortDirection } from '../../hooks/use-table-sort'
import { useTableFilters, type FilterConfig } from '../../hooks/use-table-filters'
import { SearchInput } from './search-input'
import { FilterDropdown } from './filter-dropdown'
import { Pagination, type PaginationConfig } from './pagination'

export interface SortableColumn<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
  sortKey?: string // Use a different key for sorting than the column key
}

interface SortableDataTableProps<T> {
  data: T[]
  columns: SortableColumn<T>[]
  keyExtractor: (item: T) => string | number
  className?: string
  emptyMessage?: string
  // Sort options
  sortable?: boolean
  initialSort?: { column: string; direction: SortDirection }
  // Search options
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  // Filter options
  filters?: FilterConfig[]
  persistToUrl?: boolean
  // Pagination options
  pagination?: PaginationConfig | false
  // Row click handler
  onRowClick?: (item: T) => void
}

export function SortableDataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  className,
  emptyMessage = 'Aucune donnée',
  sortable = false,
  initialSort,
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  searchKeys = [],
  filters: filterConfigs = [],
  persistToUrl = false,
  pagination = false,
  onRowClick,
}: SortableDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  // Use filters hook
  const {
    search,
    filters,
    filteredData,
    hasActiveFilters,
    setSearch,
    setFilter,
    clearFilter,
    clearAllFilters,
  } = useTableFilters(data, {
    filters: filterConfigs,
    persistToUrl,
    searchKeys,
  })

  // Use sort hook on filtered data
  const { sortState, sortedData, toggleSort } = useTableSort(filteredData, {
    initialSort: initialSort
      ? { column: initialSort.column, direction: initialSort.direction }
      : undefined,
  })

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pagination.pageSize
    return sortedData.slice(startIndex, startIndex + pagination.pageSize)
  }, [sortedData, pagination, currentPage])

  const totalPages = pagination ? Math.ceil(sortedData.length / pagination.pageSize) : 1

  // Reset to page 1 when filters change
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [search, filters])

  const getSortIcon = (column: SortableColumn<T>) => {
    if (!sortable || column.sortable === false) return null

    const sortKey = column.sortKey || column.key
    if (sortState.column !== sortKey) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    }
    if (sortState.direction === 'asc') {
      return <ArrowUp className="w-4 h-4" />
    }
    return <ArrowDown className="w-4 h-4" />
  }

  const handleHeaderClick = (column: SortableColumn<T>) => {
    if (!sortable || column.sortable === false) return
    const sortKey = column.sortKey || column.key
    toggleSort(sortKey)
  }

  const showToolbar = searchable || filterConfigs.length > 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex flex-col sm:flex-row gap-3">
          {searchable && (
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={searchPlaceholder}
              className="sm:w-64"
            />
          )}
          {filterConfigs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filterConfigs.map((config) => (
                <FilterDropdown
                  key={config.key}
                  config={config}
                  value={filters[config.key]}
                  onChange={(value) => setFilter(config.key, value)}
                  onClear={() => clearFilter(config.key)}
                />
              ))}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 h-10 px-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Effacer tout
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results count when filtering */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {sortedData.length} résultat{sortedData.length !== 1 ? 's' : ''} trouvé
          {sortedData.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Empty state */}
      {sortedData.length === 0 ? (
        <div className="bg-secondary border-2 border-dashed border-foreground p-8 text-center">
          <p className="font-bold text-muted-foreground">
            {hasActiveFilters ? 'Aucun résultat pour ces critères' : emptyMessage}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto pr-1 pb-1">
            <table className="w-full border-collapse bg-card neo-brutal">
              <thead>
                <tr className="border-b-2 border-foreground bg-secondary">
                  {columns.map((column) => {
                    const isSortable = sortable && column.sortable !== false
                    return (
                      <th
                        key={column.key}
                        onClick={() => handleHeaderClick(column)}
                        className={cn(
                          'px-4 py-3 text-left font-bold',
                          isSortable && 'cursor-pointer select-none hover:bg-secondary/80',
                          column.headerClassName
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {column.header}
                          {getSortIcon(column)}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'border-b border-foreground/20 transition-colors hover:bg-secondary/50',
                      index === paginatedData.length - 1 && 'border-b-0',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3', column.className)}>
                        {column.render
                          ? column.render(item)
                          : (item as Record<string, unknown>)[column.key]?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedData.length}
              pageSize={pagination.pageSize}
              onPageChange={setCurrentPage}
              showFirstLast={pagination.showFirstLast}
              showPageNumbers={pagination.showPageNumbers}
            />
          )}
        </>
      )}
    </div>
  )
}
