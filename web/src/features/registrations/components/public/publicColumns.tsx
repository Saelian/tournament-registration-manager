import { formatDateShort } from '@lib/formatting-helpers'
import type { AggregatedPublicPlayer } from '../../types'
import type { PlayerTableColumn } from '../shared/types'

/**
 * Crée les colonnes de base pour le tableau public des joueurs.
 */
export function createPublicBaseColumns(): PlayerTableColumn<AggregatedPublicPlayer>[] {
  return [
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
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block" title={player.club}>
          {player.club}
        </span>
      ),
    },
  ]
}

/**
 * Crée la colonne des tableaux pour la vue publique.
 */
export function createPublicTablesColumn(): PlayerTableColumn<AggregatedPublicPlayer> {
  return {
    key: 'tables',
    header: 'Tableaux',
    sortable: false,
    render: (player) => (
      <div className="flex flex-wrap gap-1">
        {player.tables
          .slice()
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map((table) => (
            <span
              key={table.id}
              className="inline-flex items-center px-2 py-0.5 text-xs bg-secondary border border-foreground/20"
              title={`${formatDateShort(table.date)} ${table.startTime}`}
            >
              {table.name}
            </span>
          ))}
      </div>
    ),
  }
}

/**
 * Crée toutes les colonnes pour la vue publique avec tableaux.
 */
export function createPublicColumnsWithTables(): PlayerTableColumn<AggregatedPublicPlayer>[] {
  return [...createPublicBaseColumns(), createPublicTablesColumn()]
}

/**
 * Crée toutes les colonnes pour la vue publique sans tableaux.
 */
export function createPublicColumnsWithoutTables(): PlayerTableColumn<AggregatedPublicPlayer>[] {
  return createPublicBaseColumns()
}
