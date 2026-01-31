import { useState, useMemo } from 'react'
import { PageHeader } from '@components/ui/page-header'
import { CreditCard, Loader2, AlertCircle, Clock, CheckCircle, XCircle, Download, Banknote } from 'lucide-react'
import { Button } from '@components/ui/button'
import { SortableDataTable, type SortableColumn } from '@components/ui/sortable-data-table'
import { useAdminPayments, useCollectPayment } from '../hooks'
import { ProcessRefundModal } from '../components/admin/ProcessRefundModal'
import { PaymentDetailsModal } from '../components/admin/PaymentDetailsModal'
import { CollectPaymentModal } from '../components/admin/CollectPaymentModal'
import { formatDateTime, formatPrice } from '../../../lib/formatters'
import { CsvExportModal, useExportCsv, type ExportColumn } from '@components/export'
import type { PaymentData } from '../types'
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

interface PaymentTableRow extends PaymentData {
  subscriberName: string
  subscriberEmail: string
}

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
    key: 'status',
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const { data, isLoading, error } = useAdminPayments()
  const collectMutation = useCollectPayment()

  // Export CSV
  const { exportCsv, isExporting } = useExportCsv({
    endpoint: '/admin/exports/payments',
    filenamePrefix: 'paiements',
  })

  const allPayments = useMemo(() => data?.payments ?? [], [data?.payments])
  const pendingRefunds = data?.pendingRefunds ?? 0

  const tableData: PaymentTableRow[] = useMemo(
    () =>
      allPayments.map((p) => ({
        ...p,
        subscriberName: getSubscriberName(p.subscriber),
        subscriberEmail: p.subscriber.email,
      })),
    [allPayments]
  )

  const columns: SortableColumn<PaymentTableRow>[] = useMemo(
    () => [
      {
        key: 'subscriberName',
        header: 'Inscripteur',
        render: (payment) => (
          <div>
            <div className="font-medium">{payment.subscriberName}</div>
            <div className="text-sm text-muted-foreground">{payment.subscriberEmail}</div>
          </div>
        ),
      },
      {
        key: 'amount',
        header: 'Montant',
        render: (payment) => (
          <span className="font-bold">{formatPrice(payment.amount / 100)} &euro;</span>
        ),
      },
      {
        key: 'paymentMethod',
        header: 'Mode',
        render: (payment) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${PAYMENT_METHOD_COLORS[payment.paymentMethod] || 'bg-gray-200 text-gray-900 border-gray-600'}`}
          >
            {PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        render: (payment) => <span className="text-sm">{formatDateTime(payment.createdAt)}</span>,
      },
      {
        key: 'status',
        header: 'Statut',
        render: (payment) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${PAYMENT_STATUS_COLORS[payment.status]}`}
          >
            {PAYMENT_STATUS_LABELS[payment.status]}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (payment) => (
          <div className="flex gap-2">
            {payment.status === 'refund_requested' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPayment(payment)
                }}
              >
                Traiter
              </Button>
            )}
            {payment.status === 'pending' && payment.paymentMethod !== 'helloasso' && (
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation()
                  setCollectPaymentData(payment)
                }}
              >
                <Banknote className="h-4 w-4 mr-1" />
                Encaisser
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
                Filtrez par &quot;Remboursement demandé&quot; pour les voir
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
        keyExtractor={(payment) => payment.id}
        sortable
        initialSort={{ column: 'createdAt', direction: 'desc' }}
        searchable
        searchPlaceholder="Rechercher par nom ou email..."
        searchKeys={['subscriberName', 'subscriberEmail']}
        filters={FILTER_CONFIGS}
        pagination={{ pageSize: 20, showFirstLast: true, showPageNumbers: true }}
        onRowClick={setDetailsPayment}
        emptyMessage="Aucun paiement trouvé"
      />

      {/* Modal de traitement */}
      <ProcessRefundModal
        open={selectedPayment !== null}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
        payment={selectedPayment}
      />

      {/* Modal de détails */}
      <PaymentDetailsModal
        open={detailsPayment !== null}
        onOpenChange={(open) => !open && setDetailsPayment(null)}
        payment={detailsPayment}
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
        onConfirm={() => {
          if (collectPaymentData) {
            collectMutation.mutate(collectPaymentData.id, {
              onSuccess: () => setCollectPaymentData(null),
            })
          }
        }}
        isLoading={collectMutation.isPending}
      />
    </div>
  )
}
