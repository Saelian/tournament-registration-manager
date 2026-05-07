import { useMemo } from 'react'
import { ScrollText, Loader2 } from 'lucide-react'
import { PageHeader } from '@components/ui/page-header'
import { SortableDataTable, type SortableColumn } from '@components/ui/sortable-data-table'
import { useAdminAuditLog, type AuditEvent, type AuditEventType } from '../hooks/useAdminAuditLog'
import { formatDateTime } from '../../../lib/formatters'
import type { FilterConfig } from '../../../hooks/use-table-filters'

const AUDIT_EVENT_LABELS: Record<AuditEventType, string> = {
  inscription_utilisateur: 'Inscription joueur',
  inscription_admin: 'Inscription admin',
  promotion_liste_attente: "Promotion liste d'attente",
  paiement_confirme: 'Paiement confirmé',
  remboursement: 'Remboursement',
  remboursement_partiel: 'Remboursement partiel',
  annulation_admin: 'Annulation admin',
  annulation_joueur: 'Désinscription joueur',
  demande_remboursement: 'Remboursement demandé',
  pointage: 'Pointage',
}

const AUDIT_EVENT_COLORS: Record<AuditEventType, string> = {
  inscription_utilisateur: 'bg-blue-200 text-blue-900 border-blue-600',
  inscription_admin: 'bg-violet-200 text-violet-900 border-violet-600',
  promotion_liste_attente: 'bg-orange-200 text-orange-900 border-orange-600',
  paiement_confirme: 'bg-green-200 text-green-900 border-green-600',
  remboursement: 'bg-yellow-200 text-yellow-900 border-yellow-600',
  remboursement_partiel: 'bg-teal-200 text-teal-900 border-teal-600',
  annulation_admin: 'bg-red-200 text-red-900 border-red-600',
  annulation_joueur: 'bg-pink-200 text-pink-900 border-pink-600',
  demande_remboursement: 'bg-amber-200 text-amber-900 border-amber-600',
  pointage: 'bg-emerald-200 text-emerald-900 border-emerald-600',
}

const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: 'type',
    label: "Type d'événement",
    type: 'select',
    options: [
      { value: 'inscription_utilisateur', label: 'Inscription joueur' },
      { value: 'inscription_admin', label: 'Inscription admin' },
      { value: 'promotion_liste_attente', label: "Promotion liste d'attente" },
      { value: 'paiement_confirme', label: 'Paiement confirmé' },
      { value: 'remboursement', label: 'Remboursement' },
      { value: 'remboursement_partiel', label: 'Remboursement partiel' },
      { value: 'annulation_admin', label: 'Annulation admin' },
      { value: 'annulation_joueur', label: 'Désinscription joueur' },
      { value: 'demande_remboursement', label: 'Remboursement demandé' },
      { value: 'pointage', label: 'Pointage' },
    ],
  },
]

export function AdminLogsPage() {
  const { data, isLoading, error } = useAdminAuditLog()

  const events = useMemo(() => data?.events ?? [], [data?.events])

  const columns: SortableColumn<AuditEvent>[] = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Horodatage',
        render: (event) => (
          <span className="text-sm font-mono">{formatDateTime(event.timestamp)}</span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (event) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${AUDIT_EVENT_COLORS[event.type]}`}
          >
            {AUDIT_EVENT_LABELS[event.type]}
          </span>
        ),
      },
      {
        key: 'playerName',
        header: 'Joueur',
        render: (event) => (
          <div>
            <div className="font-medium">{event.playerName}</div>
            <div className="text-xs text-muted-foreground">{event.playerLicence}</div>
          </div>
        ),
      },
      {
        key: 'tableName',
        header: 'Tableau',
        render: (event) => <span className="text-sm">{event.tableName ?? '—'}</span>,
      },
      {
        key: 'actor',
        header: 'Acteur',
        render: (event) => (
          <span className="text-sm text-muted-foreground">{event.actor ?? '—'}</span>
        ),
      },
      {
        key: 'details',
        header: 'Détails',
        render: (event) => <span className="text-sm">{event.details}</span>,
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 border-2 border-destructive p-4">
          <p className="font-bold text-destructive">Erreur lors du chargement des journaux</p>
          <p className="text-sm text-destructive/80">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="Journaux"
        description="Historique chronologique des événements du tournoi"
        icon={ScrollText}
      />

      <SortableDataTable
        data={events}
        columns={columns}
        keyExtractor={(event) => event.id}
        sortable
        initialSort={{ column: 'timestamp', direction: 'desc' }}
        searchable
        searchPlaceholder="Rechercher par joueur ou licence..."
        searchKeys={['playerName', 'playerLicence']}
        filters={FILTER_CONFIGS}
        pagination={{ pageSize: 50, showFirstLast: true, showPageNumbers: true }}
        emptyMessage="Aucun événement trouvé"
      />
    </div>
  )
}
