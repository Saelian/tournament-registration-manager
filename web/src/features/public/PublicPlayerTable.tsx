import { useState, useMemo } from 'react'
import { SortableDataTable, type SortableColumn } from '../../components/ui/sortable-data-table'
import type { PublicRegistrationData, AggregatedPublicPlayer } from './types'
import { SearchInput } from '../../components/ui/search-input'

interface PublicPlayerTableProps {
  registrations: PublicRegistrationData[]
  tournamentDays?: string[]
  showDayFilter?: boolean
  showTableColumn?: boolean
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** Composant carte pour l'affichage mobile */
function MobilePlayerCard({
  player,
  showTableColumn,
}: {
  player: AggregatedPublicPlayer
  showTableColumn: boolean
}) {
  return (
    <div className="bg-card border-2 border-foreground p-4 shadow-[2px_2px_0px_0px] shadow-foreground">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="font-black text-lg uppercase">{player.lastName}</span>{' '}
          <span className="font-semibold">{player.firstName}</span>
        </div>
        <span className="bg-primary text-primary-foreground font-bold text-sm px-2 py-1">
          {player.points} pts
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
        <div>
          <span className="font-medium">Licence:</span>{' '}
          <span className="font-mono">{player.licence}</span>
        </div>
        <div>
          <span className="font-medium">Cat.:</span> {player.category || '-'}
        </div>
        <div className="col-span-2 truncate" title={player.club}>
          <span className="font-medium">Club:</span> {player.club}
        </div>
      </div>

      {showTableColumn && player.tables.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-foreground/10">
          {player.tables
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((table) => (
              <span
                key={table.id}
                className="inline-flex items-center px-2 py-0.5 text-xs bg-secondary border border-foreground/20"
                title={`${formatDate(table.date)} ${table.startTime}`}
              >
                {table.name}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}

/**
 * Agrège les inscriptions par joueur (un joueur peut être inscrit à plusieurs tableaux).
 */
function aggregateByPlayer(
  registrations: PublicRegistrationData[],
  dayFilter?: string
): AggregatedPublicPlayer[] {
  const filtered = dayFilter
    ? registrations.filter((r) => r.table.date === dayFilter)
    : registrations

  const byPlayer = new Map<string, AggregatedPublicPlayer>()

  for (const reg of filtered) {
    const key = reg.player.licence
    const existing = byPlayer.get(key)
    if (existing) {
      // Éviter les doublons de tableaux
      if (!existing.tables.find((t) => t.id === reg.table.id)) {
        existing.tables.push(reg.table)
      }
    } else {
      byPlayer.set(key, {
        licence: reg.player.licence,
        firstName: reg.player.firstName,
        lastName: reg.player.lastName,
        points: reg.player.points,
        category: reg.player.category,
        club: reg.player.club,
        tables: [reg.table],
      })
    }
  }

  return Array.from(byPlayer.values()).sort((a, b) => a.lastName.localeCompare(b.lastName))
}

export function PublicPlayerTable({
  registrations,
  tournamentDays = [],
  showDayFilter = true,
  showTableColumn = true,
}: PublicPlayerTableProps) {
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)

  const aggregatedPlayers = useMemo(
    () => aggregateByPlayer(registrations, selectedDay),
    [registrations, selectedDay]
  )

  const columns: SortableColumn<AggregatedPublicPlayer>[] = useMemo(() => {
    const cols: SortableColumn<AggregatedPublicPlayer>[] = [
      {
        key: 'licence',
        header: 'Licence',
        sortable: true,
        render: (player) => <span className="font-mono text-sm">{player.licence}</span>,
      },
      {
        key: 'lastName',
        header: 'Nom',
        sortable: true,
        render: (player) => <span className="font-semibold">{player.lastName.toUpperCase()}</span>,
      },
      {
        key: 'firstName',
        header: 'Prénom',
        sortable: true,
      },
      {
        key: 'points',
        header: 'Pts',
        sortable: true,
        className: 'text-right',
        headerClassName: 'text-right',
      },
      {
        key: 'category',
        header: 'Cat.',
        sortable: true,
        render: (player) => <span>{player.category || '-'}</span>,
      },
      {
        key: 'club',
        header: 'Club',
        sortable: true,
        render: (player) => (
          <span
            className="text-sm text-muted-foreground truncate max-w-[200px] block"
            title={player.club}
          >
            {player.club}
          </span>
        ),
      },
    ]

    if (showTableColumn) {
      cols.push({
        key: 'tables',
        header: 'Tableaux',
        sortable: false,
        render: (player) => (
          <div className="flex flex-wrap gap-1">
            {player.tables
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((table) => (
                <span
                  key={table.id}
                  className="inline-flex items-center px-2 py-0.5 text-xs bg-secondary border border-foreground/20"
                  title={`${formatDate(table.date)} ${table.startTime}`}
                >
                  {table.name}
                </span>
              ))}
          </div>
        ),
      })
    }

    return cols
  }, [showTableColumn])

  const handleDayFilterChange = (value: string) => {
    setSelectedDay(value || undefined)
  }

  // État pour la recherche mobile
  const [mobileSearch, setMobileSearch] = useState('')
  const [mobilePage, setMobilePage] = useState(1)
  const MOBILE_PAGE_SIZE = 10

  // Filtrer les joueurs pour la vue mobile
  const filteredMobilePlayers = useMemo(() => {
    if (!mobileSearch) return aggregatedPlayers
    const searchLower = mobileSearch.toLowerCase()
    return aggregatedPlayers.filter(
      (p) =>
        p.lastName.toLowerCase().includes(searchLower) ||
        p.firstName.toLowerCase().includes(searchLower) ||
        p.licence.toLowerCase().includes(searchLower) ||
        p.club.toLowerCase().includes(searchLower)
    )
  }, [aggregatedPlayers, mobileSearch])

  const paginatedMobilePlayers = useMemo(() => {
    const start = (mobilePage - 1) * MOBILE_PAGE_SIZE
    return filteredMobilePlayers.slice(start, start + MOBILE_PAGE_SIZE)
  }, [filteredMobilePlayers, mobilePage])

  const totalMobilePages = Math.ceil(filteredMobilePlayers.length / MOBILE_PAGE_SIZE)

  return (
    <div className="space-y-4">
      {showDayFilter && tournamentDays.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor="day-filter" className="font-semibold">
            Jour :
          </label>
          <select
            id="day-filter"
            value={selectedDay || ''}
            onChange={(e) => handleDayFilterChange(e.target.value)}
            className="px-3 py-2 border-2 border-foreground bg-card font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les jours</option>
            {tournamentDays.map((day) => (
              <option key={day} value={day}>
                {formatDate(day)}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">
            {aggregatedPlayers.length} joueur{aggregatedPlayers.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Vue Desktop : Tableau */}
      <div className="hidden md:block">
        <SortableDataTable
          data={aggregatedPlayers}
          columns={columns}
          keyExtractor={(player) => player.licence}
          sortable
          initialSort={{ column: 'lastName', direction: 'asc' }}
          searchable
          searchPlaceholder="Rechercher un joueur..."
          searchKeys={['lastName', 'firstName', 'licence', 'club']}
          pagination={{ pageSize: 20, showFirstLast: true, showPageNumbers: true }}
          emptyMessage="Aucun joueur inscrit"
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
              {mobileSearch ? 'Aucun résultat pour cette recherche' : 'Aucun joueur inscrit'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedMobilePlayers.map((player) => (
              <MobilePlayerCard
                key={player.licence}
                player={player}
                showTableColumn={showTableColumn}
              />
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
