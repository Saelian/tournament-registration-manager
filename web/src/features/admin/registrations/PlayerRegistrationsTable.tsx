import { useState, useMemo } from 'react'
import { SortableDataTable, type SortableColumn } from '../../../components/ui/sortable-data-table'
import type { AggregatedPlayerRow, RegistrationData } from './types'
import { useAggregatedPlayers } from './hooks'

interface PlayerRegistrationsTableProps {
  registrations: RegistrationData[]
  tournamentDays?: string[]
  showDayFilter?: boolean
  showTableColumn?: boolean
  onPlayerClick?: (player: AggregatedPlayerRow) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function PlayerRegistrationsTable({
  registrations,
  tournamentDays = [],
  showDayFilter = true,
  showTableColumn = true,
  onPlayerClick,
}: PlayerRegistrationsTableProps) {
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)

  const aggregatedPlayers = useAggregatedPlayers(registrations, selectedDay)

  const columns: SortableColumn<AggregatedPlayerRow>[] = useMemo(() => {
    const cols: SortableColumn<AggregatedPlayerRow>[] = [
      {
        key: 'bibNumber',
        header: 'Dossard',
        sortable: true,
        render: (player) => (
          <span className="font-mono font-bold">
            {player.bibNumber ? `#${player.bibNumber}` : '-'}
          </span>
        ),
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
        key: 'licence',
        header: 'Licence',
        sortable: true,
        render: (player) => <span className="font-mono text-sm">{player.licence}</span>,
      },
      {
        key: 'points',
        header: 'Pts',
        sortable: true,
        className: 'text-right',
        headerClassName: 'text-right',
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary border border-foreground/20"
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

  return (
    <div className="space-y-4">
      {showDayFilter && tournamentDays.length > 0 && (
        <div className="flex items-center gap-4">
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

      <SortableDataTable
        data={aggregatedPlayers}
        columns={columns}
        keyExtractor={(player) => player.playerId}
        sortable
        initialSort={{ column: 'lastName', direction: 'asc' }}
        searchable
        searchPlaceholder="Rechercher un joueur..."
        searchKeys={['lastName', 'firstName', 'licence']}
        pagination={{ pageSize: 20, showFirstLast: true, showPageNumbers: true }}
        emptyMessage="Aucune inscription"
        onRowClick={onPlayerClick}
      />
    </div>
  )
}
