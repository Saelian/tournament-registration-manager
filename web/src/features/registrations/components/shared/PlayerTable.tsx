import { useState, useMemo } from 'react'
import { SortableDataTable, type SortableColumn } from '@components/ui/sortable-data-table'
import { SearchInput } from '@components/ui/search-input'
import { formatDateShort } from '@lib/formatting-helpers'
import { MobilePlayerCard } from './MobilePlayerCard'
import type { BaseAggregatedPlayer, PlayerTableProps } from './types'

/**
 * Composant tableau de joueurs partagé.
 * Utilisable pour les contextes admin et public avec des colonnes configurables.
 */
export function PlayerTable<T extends BaseAggregatedPlayer>({
  data,
  keyExtractor,
  columns,
  showDayFilter = false,
  tournamentDays = [],
  selectedDay: controlledSelectedDay,
  onDayChange,
  pageSize = 20,
  mobileCardRender,
  onRowClick,
  emptyMessage = 'Aucun joueur inscrit',
  searchKeys = ['lastName', 'firstName', 'licence', 'club'],
  additionalFilters,
}: PlayerTableProps<T>) {
  // État interne pour le jour sélectionné (si non contrôlé)
  const [internalSelectedDay, setInternalSelectedDay] = useState<string | undefined>(undefined)
  const selectedDay = controlledSelectedDay ?? internalSelectedDay

  const handleDayChange = (value: string) => {
    const newDay = value || undefined
    if (onDayChange) {
      onDayChange(newDay)
    } else {
      setInternalSelectedDay(newDay)
    }
  }

  // Convertir les colonnes en format SortableColumn
  const sortableColumns: SortableColumn<T>[] = useMemo(() => {
    return columns.map((col) => ({
      key: col.key,
      header: col.header,
      sortable: col.sortable ?? true,
      render: col.render,
      className: col.className,
      headerClassName: col.headerClassName,
    }))
  }, [columns])

  // État pour la recherche mobile
  const [mobileSearch, setMobileSearch] = useState('')
  const [mobilePage, setMobilePage] = useState(1)
  const MOBILE_PAGE_SIZE = 10

  // Filtrer les joueurs pour la vue mobile
  const filteredMobilePlayers = useMemo(() => {
    if (!mobileSearch) return data
    const searchLower = mobileSearch.toLowerCase()
    return data.filter((p) =>
      searchKeys.some((key) => {
        const value = (p as Record<string, unknown>)[key]
        return typeof value === 'string' && value.toLowerCase().includes(searchLower)
      })
    )
  }, [data, mobileSearch, searchKeys])

  const paginatedMobilePlayers = useMemo(() => {
    const start = (mobilePage - 1) * MOBILE_PAGE_SIZE
    return filteredMobilePlayers.slice(start, start + MOBILE_PAGE_SIZE)
  }, [filteredMobilePlayers, mobilePage])

  const totalMobilePages = Math.ceil(filteredMobilePlayers.length / MOBILE_PAGE_SIZE)

  // Rendu par défaut pour la carte mobile
  const defaultMobileCardRender = (player: T) => <MobilePlayerCard player={player} showTableColumn={true} />

  return (
    <div className="space-y-4">
      {/* Filtres */}
      {(showDayFilter || additionalFilters) && (
        <div className="flex flex-wrap items-center gap-4">
          {showDayFilter && tournamentDays.length > 0 && (
            <>
              <label htmlFor="day-filter" className="font-semibold">
                Jour :
              </label>
              <select
                id="day-filter"
                value={selectedDay || ''}
                onChange={(e) => handleDayChange(e.target.value)}
                className="px-3 py-2 border-2 border-foreground bg-card font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tous les jours</option>
                {tournamentDays.map((day) => (
                  <option key={day} value={day}>
                    {formatDateShort(day)}
                  </option>
                ))}
              </select>
            </>
          )}
          {additionalFilters}
          <span className="text-sm text-muted-foreground">
            {data.length} joueur{data.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Vue Desktop : Tableau */}
      <div className="hidden md:block">
        <SortableDataTable
          data={data}
          columns={sortableColumns}
          keyExtractor={keyExtractor}
          sortable
          initialSort={{ column: 'lastName', direction: 'asc' }}
          searchable
          searchPlaceholder="Rechercher un joueur..."
          searchKeys={searchKeys as (keyof T)[]}
          pagination={{ pageSize, showFirstLast: true, showPageNumbers: true }}
          emptyMessage={emptyMessage}
          onRowClick={onRowClick}
        />
      </div>

      {/* Vue Mobile : Cartes */}
      <div className="md:hidden space-y-4">
        {/* Recherche mobile */}
        <SearchInput
          value={mobileSearch}
          onChange={(val) => {
            setMobileSearch(val)
            setMobilePage(1)
          }}
          placeholder="Rechercher un joueur..."
        />

        {/* Compteur */}
        <div className="text-sm text-muted-foreground">
          {filteredMobilePlayers.length} joueur{filteredMobilePlayers.length !== 1 ? 's' : ''}
        </div>

        {/* Liste des cartes */}
        {paginatedMobilePlayers.length === 0 ? (
          <div className="bg-secondary border-2 border-dashed border-foreground p-8 text-center">
            <p className="font-bold text-muted-foreground">
              {mobileSearch ? 'Aucun résultat pour cette recherche' : emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedMobilePlayers.map((player) => (
              <div key={keyExtractor(player)}>
                {mobileCardRender ? mobileCardRender(player) : defaultMobileCardRender(player)}
              </div>
            ))}
          </div>
        )}

        {/* Pagination mobile */}
        {totalMobilePages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
              disabled={mobilePage === 1}
              className="px-3 py-2 border-2 border-foreground bg-card font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <span className="font-bold px-4">
              {mobilePage} / {totalMobilePages}
            </span>
            <button
              type="button"
              onClick={() => setMobilePage((p) => Math.min(totalMobilePages, p + 1))}
              disabled={mobilePage === totalMobilePages}
              className="px-3 py-2 border-2 border-foreground bg-card font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
