import type { ReactNode } from 'react'
import { CheckCircle, CreditCard, Clock, ShieldCheck, UserCheck, ArrowUp, Link2 } from 'lucide-react'
import { Button } from '@components/ui/button'
import { REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_COLORS } from '@constants/status-mappings'
import { formatDateShort } from '@lib/formatting-helpers'
import type { AggregatedPlayerRow } from '../../types'
import type { PlayerTableColumn } from '../shared/types'

const STATUS_ICONS: Record<string, ReactNode> = {
  paid: <CheckCircle className="w-3 h-3" />,
  pending_payment: <CreditCard className="w-3 h-3" />,
  waitlist: <Clock className="w-3 h-3" />,
}

/**
 * Crée les colonnes de base pour le tableau admin des joueurs.
 */
export function createAdminBaseColumns(): PlayerTableColumn<AggregatedPlayerRow>[] {
  return [
    {
      key: 'bibNumber',
      header: 'Dossard',
      sortable: true,
      render: (player) => (
        <span className="font-mono font-bold">{player.bibNumber ? `#${player.bibNumber}` : '-'}</span>
      ),
    },
    {
      key: 'lastName',
      header: 'Nom',
      sortable: true,
      render: (player) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{player.lastName.toUpperCase()}</span>
          {player.hasAdminRegistration && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 border border-purple-300"
              title="Au moins une inscription de ce joueur a été créée par un admin"
            >
              <ShieldCheck className="w-3 h-3" />
              Admin
            </span>
          )}
        </div>
      ),
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
}

/**
 * Crée la colonne des tableaux avec badges de statut.
 */
export function createTablesColumn(): PlayerTableColumn<AggregatedPlayerRow> {
  return {
    key: 'tables',
    header: 'Tableaux',
    sortable: false,
    render: (player) => (
      <div className="flex flex-wrap gap-1">
        {player.tables
          .slice()
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map((table) => {
            const status = player.registrationStatuses[table.id]
            const waitlistRank = player.registrationWaitlistRanks[table.id]
            return (
              <span
                key={table.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border ${REGISTRATION_STATUS_COLORS[status] || 'bg-secondary border-foreground/20'}`}
                title={`${formatDateShort(table.date)} ${table.startTime} - ${REGISTRATION_STATUS_LABELS[status] || status}${status === 'waitlist' && waitlistRank ? ` #${waitlistRank}` : ''}`}
              >
                {STATUS_ICONS[status]}
                {table.name}
                {status === 'waitlist' && waitlistRank && ` #${waitlistRank}`}
              </span>
            )
          })}
      </div>
    ),
  }
}

interface StatusColumnOptions {
  onPromoteClick?: (registrationId: number, playerName: string, tableName: string) => void
  onGeneratePaymentLink?: (registrationId: number, playerName: string) => void
}

/**
 * Crée la colonne de statut avec actions (pour vue par tableau).
 */
export function createStatusColumn(options: StatusColumnOptions = {}): PlayerTableColumn<AggregatedPlayerRow> {
  const { onPromoteClick, onGeneratePaymentLink } = options

  return {
    key: 'status',
    header: 'Statut',
    sortable: false,
    render: (player) => {
      const table = player.tables[0]
      if (!table) return null

      const status = player.registrationStatuses[table.id]
      const waitlistRank = player.registrationWaitlistRanks[table.id]
      const registrationId = player.registrationIdByTableId[table.id]

      return (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border font-medium ${REGISTRATION_STATUS_COLORS[status] || 'bg-secondary border-foreground/20'}`}
          >
            {STATUS_ICONS[status]}
            {REGISTRATION_STATUS_LABELS[status] || status}
            {status === 'waitlist' && waitlistRank && ` #${waitlistRank}`}
          </span>
          {status === 'waitlist' && onPromoteClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onPromoteClick(registrationId, `${player.firstName} ${player.lastName}`, table.name)
              }}
              className="h-6 px-2 text-xs"
              title="Promouvoir (envoie un email au joueur)"
            >
              <ArrowUp className="w-3 h-3 mr-1" />
              Promouvoir
            </Button>
          )}
          {status === 'pending_payment' && onGeneratePaymentLink && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onGeneratePaymentLink(registrationId, `${player.firstName} ${player.lastName}`)
              }}
              className="h-6 px-2 text-xs"
              title="Générer un lien de paiement HelloAsso"
            >
              <Link2 className="w-3 h-3 mr-1" />
              Lien paiement
            </Button>
          )}
        </div>
      )
    },
  }
}

/**
 * Crée la colonne de présence.
 */
export function createPresenceColumn(): PlayerTableColumn<AggregatedPlayerRow> {
  return {
    key: 'presence',
    header: 'Présence',
    sortable: false,
    render: (player) => {
      const table = player.tables[0]
      if (!table) return null

      const checkedInAt = player.registrationCheckedInAt[table.id]

      if (checkedInAt) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs border font-medium bg-green-100 text-green-700 border-green-300">
            <UserCheck className="w-3 h-3" />
            {checkedInAt}
          </span>
        )
      }

      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs border font-medium bg-gray-100 text-gray-500 border-gray-300">
          -
        </span>
      )
    },
  }
}

/**
 * Crée toutes les colonnes pour la vue "Tous les joueurs" (admin).
 */
export function createAllPlayersColumns(): PlayerTableColumn<AggregatedPlayerRow>[] {
  return [...createAdminBaseColumns(), createTablesColumn()]
}

/**
 * Crée toutes les colonnes pour la vue par tableau (admin).
 */
export function createByTableColumns(options: StatusColumnOptions = {}): PlayerTableColumn<AggregatedPlayerRow>[] {
  return [...createAdminBaseColumns(), createStatusColumn(options), createPresenceColumn()]
}
