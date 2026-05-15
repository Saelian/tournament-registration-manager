import { useState, useMemo } from 'react'
import { PageHeader } from '@components/ui/page-header'
import { CreditCard, Loader2, AlertCircle, Clock, CheckCircle, XCircle, Download, Banknote } from 'lucide-react'
import { Button } from '@components/ui/button'
import { SortableDataTable, type SortableColumn } from '@components/ui/sortable-data-table'
import { useAdminPayments, useCollectPayment, useProcessPartialRefund } from '../hooks'
import { ProcessRefundModal } from '../components/admin/ProcessRefundModal'
import { ProcessPartialRefundModal } from '../components/admin/ProcessPartialRefundModal'
import { PartialRefundDetailsModal } from '../components/admin/PartialRefundDetailsModal'
import { PaymentDetailsModal } from '../components/admin/PaymentDetailsModal'
import { CollectPaymentModal } from '../components/admin/CollectPaymentModal'
import { formatDateTime, formatPrice } from '../../../lib/formatters'
import { CsvExportModal, useExportCsv, type ExportColumn } from '@components/export'
import type { PaymentData, PartialRefund } from '../types'
import type { FilterConfig } from '../../../hooks/use-table-filters'
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_FILTERS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_COLORS,
  PAYMENT_METHOD_FILTERS,
} from '@constants/status-mappings'
import { getSubscriberName } from '../../../lib/formatting-helpers'
import { toast } from 'sonner'

interface UnifiedPaymentRow {
  rowKey: string
  rowType: 'payment' | 'partial_refund'
  subscriberName: string
  subscriberEmail: string
  playerNames: string[]
  playerNamesSearchable: string
  amountCents: number
  paymentMethod: string | null
  createdAt: string | null
  status: string | null
  effectiveStatus: string | null
  _payment: PaymentData | null
  _partialRefund: PartialRefund | null
}

const MAX_PLAYER_NAMES_DISPLAYED = 3

// Colonnes disponibles pour l'export des paiements
const PAYMENTS_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'createdAt', label: 'Date', included: true },
  { key: 'subscriberFirstName', label: 'Prénom inscripteur', included: true },
  { key: 'subscriberLastName', label: 'Nom inscripteur', included: true },
  { key: 'subscriberEmail', label: 'Email', included: true },
  { key: 'amount', label: 'Montant', included: true },
  { key: 'paymentMethod', label: 'Mode de paiement', included: true },
  { key: 'status', label: 'Statut', included: true },
  { key: 'refundMethod', label: 'Méthode de remboursement', included: true },
  { key: 'refundedAt', label: 'Date de remboursement', included: true },
  { key: 'players', label: 'Joueurs', included: true },
  { key: 'tables', label: 'Tableaux', included: true },
]

const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: 'effectiveStatus',
    label: 'Statut',
    type: 'select',
    options: PAYMENT_STATUS_FILTERS,
  },
  {
    key: 'paymentMethod',
    label: 'Mode de paiement',
    type: 'select',
    options: PAYMENT_METHOD_FILTERS,
  },
]

export function AdminPaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null)
  const [detailsPayment, setDetailsPayment] = useState<PaymentData | null>(null)
  const [collectPaymentData, setCollectPaymentData] = useState<PaymentData | null>(null)
  const [selectedPartialRefund, setSelectedPartialRefund] = useState<PartialRefund | null>(null)
  const [detailsPartialRefund, setDetailsPartialRefund] = useState<PartialRefund | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const { data, isLoading, error } = useAdminPayments()
  const collectMutation = useCollectPayment()
  const processPartialRefundMutation = useProcessPartialRefund()

  // Export CSV
  const { exportCsv, isExporting } = useExportCsv({
    endpoint: '/admin/exports/payments',
    filenamePrefix: 'paiements',
  })

  const allPayments = useMemo(() => data?.payments ?? [], [data?.payments])
  const pendingRefunds = data?.pendingRefunds ?? 0
  const partialRefunds = useMemo(() => data?.partialRefunds ?? [], [data?.partialRefunds])

  const tableData: UnifiedPaymentRow[] = useMemo(() => {
    const paymentRows: UnifiedPaymentRow[] = allPayments.map((p) => {
      const playerNames = p.registrations.map((r) => `${r.player.firstName} ${r.player.lastName}`)
      return {
        rowKey: `payment-${p.id}`,
        rowType: 'payment',
        subscriberName: getSubscriberName(p.subscriber),
        subscriberEmail: p.subscriber.email,
        playerNames,
        playerNamesSearchable: playerNames.join(' '),
        amountCents: p.amount,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,
        status: p.status,
        effectiveStatus: p.status === 'refund_requested' ? 'refund_awaiting' : p.status,
        _payment: p,
        _partialRefund: null,
      }
    })

    const partialRefundRows: UnifiedPaymentRow[] = partialRefunds.map((r) => ({
      rowKey: `partial-${r.registrationId}`,
      rowType: 'partial_refund',
      subscriberName: getSubscriberName(r.subscriber),
      subscriberEmail: r.subscriber.email,
      playerNames: [r.playerName],
      playerNamesSearchable: r.playerName,
      amountCents: r.amountCents,
      // Done rows: show the actual refund method ; pending rows: show the original payment method
      paymentMethod: r.refundStatus === 'done' ? r.refundMethod : r.originalPaymentMethod,
      // Done rows: show refundedAt ; pending rows: show cancelledAt
      createdAt: r.refundStatus === 'done' ? (r.refundedAt ?? r.cancelledAt) : r.cancelledAt,
      status: null,
      effectiveStatus: r.refundStatus === 'requested' ? 'refund_awaiting' : r.refundStatus === 'done' ? 'refunded' : null,
      _payment: null,
      _partialRefund: r,
    }))

    // Partial refund rows appear first for visibility
    return [...partialRefundRows, ...paymentRows]
  }, [allPayments, partialRefunds])

  const columns: SortableColumn<UnifiedPaymentRow>[] = useMemo(
    () => [
      {
        key: 'subscriberName',
        header: 'Inscripteur',
        render: (row) => (
          <div>
            <div className="font-medium">{row.subscriberName}</div>
            <div className="text-sm text-muted-foreground">{row.subscriberEmail}</div>
          </div>
        ),
      },
      {
        key: 'playerNamesSearchable',
        header: 'Joueurs',
        render: (row) => {
          if (row.playerNames.length === 0) {
            return <span className="text-muted-foreground text-sm">—</span>
          }
          const visible = row.playerNames.slice(0, MAX_PLAYER_NAMES_DISPLAYED)
          const hidden = row.playerNames.length - visible.length
          return (
            <div className="text-sm">
              {visible.map((name, i) => (
                <div key={i}>{name}</div>
              ))}
              {hidden > 0 && (
                <div className="text-xs text-muted-foreground">+{hidden} autre{hidden > 1 ? 's' : ''}</div>
              )}
            </div>
          )
        },
      },
      {
        key: 'amountCents',
        header: 'Montant',
        render: (row) => (
          <span className="font-bold">{formatPrice(row.amountCents / 100)} &euro;</span>
        ),
      },
      {
        key: 'paymentMethod',
        header: 'Mode',
        render: (row) =>
          row.paymentMethod ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${PAYMENT_METHOD_COLORS[row.paymentMethod] || 'bg-gray-200 text-gray-900 border-gray-600'}`}
            >
              {PAYMENT_METHOD_LABELS[row.paymentMethod] || row.paymentMethod}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        render: (row) => (
          <span className="text-sm">{row.createdAt ? formatDateTime(row.createdAt) : '—'}</span>
        ),
      },
      {
        key: 'status',
        header: 'Statut',
        render: (row) =>
          row.rowType === 'payment' && row.status ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${PAYMENT_STATUS_COLORS[row.status]}`}
            >
              {PAYMENT_STATUS_LABELS[row.status]}
            </span>
          ) : row._partialRefund?.refundStatus === 'done' ? (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold border bg-teal-100 text-teal-900 border-teal-600">
              Remb. partiel traité
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold border bg-orange-100 text-orange-900 border-orange-600">
              Remb. partiel
            </span>
          ),
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            {row.rowType === 'payment' && row.status === 'refund_requested' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPayment(row._payment!)
                }}
              >
                Traiter
              </Button>
            )}
            {row.rowType === 'payment' && row.status === 'pending' && row.paymentMethod !== 'helloasso' && (
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation()
                  setCollectPaymentData(row._payment!)
                }}
              >
                <Banknote className="h-4 w-4 mr-1" />
                Encaisser
              </Button>
            )}
            {row.rowType === 'partial_refund' && row._partialRefund?.refundStatus === 'requested' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPartialRefund(row._partialRefund!)
                }}
              >
                Traiter
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  )

  const handleExport = async (config: { columns: ExportColumn[]; separator: ';' | ',' | '\t' }) => {
    await exportCsv(config)
    setIsExportModalOpen(false)
  }

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
          <p className="font-bold text-destructive">Erreur lors du chargement des paiements</p>
          <p className="text-sm text-destructive/80">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader
        title="Paiements"
        description="Suivi et gestion des paiements du tournoi"
        icon={CreditCard}
        actions={
          <Button variant="secondary" onClick={() => setIsExportModalOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        }
      />

      {/* Alerte remboursements en attente */}
      {pendingRefunds > 0 && (
        <div className="mb-6 bg-orange-100 border-2 border-orange-500 p-4 shadow-shadow">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <div>
              <p className="font-bold text-orange-900">
                {pendingRefunds} remboursement{pendingRefunds > 1 ? 's' : ''} en attente de traitement
              </p>
              <p className="text-sm text-orange-800">
                Les remboursements partiels sont identifiables par le statut &quot;Remb. partiel&quot; dans le tableau
                ci-dessous.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 neo-brutal">
          <p className="text-sm font-medium text-muted-foreground">Total paiements</p>
          <p className="text-3xl font-bold">{allPayments.length}</p>
        </div>
        <div className="bg-card p-4 neo-brutal">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-muted-foreground">Payés</p>
          </div>
          <p className="text-3xl font-bold">{allPayments.filter((p) => p.status === 'succeeded').length}</p>
        </div>
        <div className="bg-card p-4 neo-brutal">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-medium text-muted-foreground">Remb. demandés</p>
          </div>
          <p className="text-3xl font-bold">{pendingRefunds}</p>
        </div>
        <div className="bg-card p-4 neo-brutal">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Remboursés</p>
          </div>
          <p className="text-3xl font-bold">{allPayments.filter((p) => p.status === 'refunded').length}</p>
        </div>
      </div>

      {/* Table avec tri, recherche, filtres et pagination */}
      <SortableDataTable
        data={tableData}
        columns={columns}
        keyExtractor={(row) => row.rowKey}
        sortable
        initialSort={{ column: 'createdAt', direction: 'desc' }}
        searchable
        searchPlaceholder="Rechercher par inscripteur, email ou joueur..."
        searchKeys={['subscriberName', 'subscriberEmail', 'playerNamesSearchable']}
        filters={FILTER_CONFIGS}
        pagination={{ pageSize: 20, showFirstLast: true, showPageNumbers: true }}
        onRowClick={(row) => {
          if (row.rowType === 'partial_refund' && row._partialRefund) {
            setDetailsPartialRefund(row._partialRefund)
          } else if (row._payment) {
            setDetailsPayment(row._payment)
          }
        }}
        emptyMessage="Aucun paiement trouvé"
      />

      {/* Modal de traitement remboursement complet */}
      <ProcessRefundModal
        open={selectedPayment !== null}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
        payment={selectedPayment}
      />

      {/* Modal de détails paiement */}
      <PaymentDetailsModal
        open={detailsPayment !== null}
        onOpenChange={(open) => !open && setDetailsPayment(null)}
        payment={detailsPayment}
      />

      {/* Modal de détails remboursement partiel */}
      <PartialRefundDetailsModal
        open={detailsPartialRefund !== null}
        onOpenChange={(open) => !open && setDetailsPartialRefund(null)}
        entry={detailsPartialRefund}
      />

      <CsvExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Exporter les paiements"
        columns={PAYMENTS_EXPORT_COLUMNS}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Modal de confirmation d'encaissement */}
      <CollectPaymentModal
        open={collectPaymentData !== null}
        onOpenChange={(open) => !open && setCollectPaymentData(null)}
        payment={collectPaymentData}
        onConfirm={(paymentMethod) => {
          if (collectPaymentData) {
            collectMutation.mutate(
              { paymentId: collectPaymentData.id, paymentMethod },
              { onSuccess: () => setCollectPaymentData(null) }
            )
          }
        }}
        isLoading={collectMutation.isPending}
      />

      {/* Modal de traitement remboursement partiel */}
      <ProcessPartialRefundModal
        open={selectedPartialRefund !== null}
        onOpenChange={(open) => !open && setSelectedPartialRefund(null)}
        entry={selectedPartialRefund}
        onConfirm={(registrationId, refundData) => {
          processPartialRefundMutation.mutate(
            { registrationId, data: refundData },
            {
              onSuccess: () => {
                toast.success('Remboursement partiel enregistré')
                setSelectedPartialRefund(null)
              },
              onError: (err) => {
                toast.error(`Erreur : ${err.message}`)
              },
            }
          )
        }}
        isPending={processPartialRefundMutation.isPending}
      />
    </div>
  )
}
