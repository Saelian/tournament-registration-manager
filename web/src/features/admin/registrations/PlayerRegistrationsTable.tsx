import { useState, useMemo } from 'react'
import { SortableDataTable, type SortableColumn } from '../../../components/ui/sortable-data-table'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { ArrowUp, Clock, CheckCircle, CreditCard, ShieldCheck, Link2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { AggregatedPlayerRow, RegistrationData } from './types'
import { useAggregatedPlayers, usePromoteRegistration } from './hooks'

interface PlayerRegistrationsTableProps {
  registrations: RegistrationData[]
  tournamentDays?: string[]
  showDayFilter?: boolean
  showTableColumn?: boolean
  showStatusColumn?: boolean
  showPresenceColumn?: boolean
  showAdminFilter?: boolean
  onPlayerClick?: (player: AggregatedPlayerRow) => void
  onGeneratePaymentLink?: (registrationId: number, playerName: string) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Payé',
  pending_payment: 'En attente de paiement',
  waitlist: "Liste d'attente",
  cancelled: 'Annulé',
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 border-green-300',
  pending_payment: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  waitlist: 'bg-orange-100 text-orange-700 border-orange-300',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-300',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  paid: <CheckCircle className="w-3 h-3" />,
  pending_payment: <CreditCard className="w-3 h-3" />,
  waitlist: <Clock className="w-3 h-3" />,
}

export function PlayerRegistrationsTable({
  registrations,
  tournamentDays = [],
  showDayFilter = true,
  showTableColumn = true,
  showStatusColumn = false,
  showPresenceColumn = false,
  showAdminFilter = false,
  onPlayerClick,
  onGeneratePaymentLink,
}: PlayerRegistrationsTableProps) {
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)
  const [adminOnlyFilter, setAdminOnlyFilter] = useState(false)
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false)
  const [registrationToPromote, setRegistrationToPromote] = useState<{
    id: number
    playerName: string
    tableName: string
  } | null>(null)

  // Filter registrations by admin-created if filter is active
  const filteredRegistrations = useMemo(() => {
    if (!adminOnlyFilter) return registrations
    return registrations.filter((r) => r.isAdminCreated)
  }, [registrations, adminOnlyFilter])

  const aggregatedPlayers = useAggregatedPlayers(filteredRegistrations, selectedDay)
  const promoteMutation = usePromoteRegistration()

  const handlePromoteClick = (
    e: React.MouseEvent,
    registrationId: number,
    playerName: string,
    tableName: string
  ) => {
    e.stopPropagation()
    setRegistrationToPromote({ id: registrationId, playerName, tableName })
    setPromoteDialogOpen(true)
  }

  const handleConfirmPromote = () => {
    if (!registrationToPromote) return

    promoteMutation.mutate(registrationToPromote.id, {
      onSuccess: () => {
        toast.success(
          `${registrationToPromote.playerName} a été promu(e). Un email lui a été envoyé.`
        )
        setPromoteDialogOpen(false)
        setRegistrationToPromote(null)
      },
      onError: (error) => {
        toast.error(`Erreur: ${error.message}`)
      },
    })
  }

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
        render: (player) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{player.lastName.toUpperCase()}</span>
            {player.hasAdminRegistration && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 border border-purple-300"
                title="Inscription créée par un admin"
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

    if (showTableColumn) {
      cols.push({
        key: 'tables',
        header: 'Tableaux',
        sortable: false,
        render: (player) => (
          <div className="flex flex-wrap gap-1">
            {player.tables
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((table) => {
                const status = player.registrationStatuses[table.id]
                const waitlistRank = player.registrationWaitlistRanks[table.id]
                return (
                  <span
                    key={table.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border ${STATUS_COLORS[status] || 'bg-secondary border-foreground/20'}`}
                    title={`${formatDate(table.date)} ${table.startTime} - ${STATUS_LABELS[status] || status}${status === 'waitlist' && waitlistRank ? ` #${waitlistRank}` : ''}`}
                  >
                    {STATUS_ICONS[status]}
                    {table.name}
                    {status === 'waitlist' && waitlistRank && ` #${waitlistRank}`}
                  </span>
                )
              })}
          </div>
        ),
      })
    }

    if (showStatusColumn) {
      cols.push({
        key: 'status',
        header: 'Statut',
        sortable: false,
        render: (player) => {
          // For single-table view, get the first table's status
          const table = player.tables[0]
          if (!table) return null

          const status = player.registrationStatuses[table.id]
          const waitlistRank = player.registrationWaitlistRanks[table.id]
          const registrationId = player.registrationIdByTableId[table.id]

          return (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border font-medium ${STATUS_COLORS[status] || 'bg-secondary border-foreground/20'}`}
              >
                {STATUS_ICONS[status]}
                {STATUS_LABELS[status] || status}
                {status === 'waitlist' && waitlistRank && ` #${waitlistRank}`}
              </span>
              {status === 'waitlist' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) =>
                    handlePromoteClick(
                      e,
                      registrationId,
                      `${player.firstName} ${player.lastName}`,
                      table.name
                    )
                  }
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
                    onGeneratePaymentLink(
                      registrationId,
                      `${player.firstName} ${player.lastName}`
                    )
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
      })
    }

    if (showPresenceColumn) {
      cols.push({
        key: 'presence',
        header: 'Présence',
        sortable: false,
        render: (player) => {
          // For single-table view, get the first table's check-in status
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
      })
    }

    return cols
  }, [showTableColumn, showStatusColumn, showPresenceColumn, onGeneratePaymentLink])

  const handleDayFilterChange = (value: string) => {
    setSelectedDay(value || undefined)
  }

  return (
    <div className="space-y-4">
      {(showDayFilter || showAdminFilter) && (
        <div className="flex flex-wrap items-center gap-4">
          {showDayFilter && tournamentDays.length > 0 && (
            <>
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
            </>
          )}
          {showAdminFilter && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={adminOnlyFilter}
                onChange={(e) => setAdminOnlyFilter(e.target.checked)}
                className="w-4 h-4 border-2 border-foreground"
              />
              <span className="flex items-center gap-1 text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Inscriptions admin uniquement
              </span>
            </label>
          )}
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

      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promouvoir depuis la liste d'attente</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir promouvoir{' '}
              <strong>{registrationToPromote?.playerName}</strong> pour le tableau{' '}
              <strong>{registrationToPromote?.tableName}</strong> ?
              <br />
              <br />
              Un email sera envoyé au joueur pour l'informer qu'une place s'est libérée et qu'il
              doit procéder au paiement dans les délais impartis.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setPromoteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmPromote} disabled={promoteMutation.isPending}>
              {promoteMutation.isPending ? 'Promotion...' : "Confirmer et envoyer l'email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
