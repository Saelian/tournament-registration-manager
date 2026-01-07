import { useState } from 'react'
import {
  CreditCard,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Banknote,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { SearchInput } from '../../../components/ui/search-input'
import { FilterDropdown } from '../../../components/ui/filter-dropdown'
import { useAdminPayments, useCollectPayment } from './hooks'
import { ProcessRefundModal } from './ProcessRefundModal'
import { PaymentDetailsModal } from './PaymentDetailsModal'
import { CollectPaymentModal } from './CollectPaymentModal'
import { formatDateTime, formatPrice } from '../../../lib/formatters'
import { CsvExportModal, useExportCsv, type ExportColumn } from '../../../components/export'
import type { PaymentData } from './types'

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

const statusFilters = [
  { value: 'succeeded', label: 'Payé' },
  { value: 'refund_requested', label: 'Remboursement demandé' },
  { value: 'refunded', label: 'Remboursé' },
  { value: 'pending', label: 'En attente' },
  { value: 'failed', label: 'Échoué' },
]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-200 text-yellow-900 border-yellow-600',
  succeeded: 'bg-green-200 text-green-900 border-green-600',
  failed: 'bg-red-200 text-red-900 border-red-600',
  expired: 'bg-secondary text-muted-foreground border-foreground/50',
  refunded: 'bg-blue-200 text-blue-900 border-blue-600',
  refund_pending: 'bg-blue-100 text-blue-800 border-blue-500',
  refund_failed: 'bg-red-200 text-red-900 border-red-600',
  refund_requested: 'bg-orange-200 text-orange-900 border-orange-600',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  succeeded: 'Payé',
  failed: 'Échec',
  expired: 'Expiré',
  refunded: 'Remboursé',
  refund_pending: 'Remboursement en cours',
  refund_failed: 'Remboursement échoué',
  refund_requested: 'Remboursement demandé',
}

const refundMethodLabels: Record<string, string> = {
  helloasso_manual: 'HelloAsso (manuel)',
  bank_transfer: 'Virement',
  cash: 'Espèces',
}

const paymentMethodLabels: Record<string, string> = {
  helloasso: 'HelloAsso',
  cash: 'Espèces',
  check: 'Chèque',
  card: 'Carte bancaire',
}

const paymentMethodFilters = [
  { value: 'helloasso', label: 'HelloAsso' },
  { value: 'cash', label: 'Espèces' },
  { value: 'check', label: 'Chèque' },
  { value: 'card', label: 'Carte bancaire' },
]

const paymentMethodColors: Record<string, string> = {
  helloasso: 'bg-purple-200 text-purple-900 border-purple-600',
  cash: 'bg-green-200 text-green-900 border-green-600',
  check: 'bg-blue-200 text-blue-900 border-blue-600',
  card: 'bg-indigo-200 text-indigo-900 border-indigo-600',
}

export function PaymentsPage() {
  const [status, setStatus] = useState<string | undefined>()
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null)
  const [detailsPayment, setDetailsPayment] = useState<PaymentData | null>(null)
  const [collectPayment, setCollectPayment] = useState<PaymentData | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const { data, isLoading, error } = useAdminPayments({
    status,
    paymentMethod: paymentMethodFilter,
    search: search || undefined,
  })

  const collectMutation = useCollectPayment()

  // Export CSV
  const { exportCsv, isExporting } = useExportCsv({
    endpoint: '/admin/exports/payments',
    filenamePrefix: 'paiements',
    additionalParams: { status, search: search || undefined },
  })

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

  const payments = data?.payments ?? []
  const pendingRefunds = data?.pendingRefunds ?? 0

  const getSubscriberName = (payment: PaymentData) => {
    const { firstName, lastName, email } = payment.subscriber
    if (firstName || lastName) {
      return `${firstName ?? ''} ${lastName ?? ''}`.trim()
    }
    return email
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8" />
            Paiements
          </h1>
          <p className="text-muted-foreground mt-2">Suivi et gestion des paiements du tournoi</p>
        </div>
        <Button variant="secondary" onClick={() => setIsExportModalOpen(true)}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Alerte remboursements en attente */}
      {pendingRefunds > 0 && (
        <div className="mb-6 bg-orange-100 border-2 border-orange-500 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <div>
              <p className="font-bold text-orange-900">
                {pendingRefunds} remboursement{pendingRefunds > 1 ? 's' : ''} en attente de
                traitement
              </p>
              <p className="text-sm text-orange-800">
                Filtrez par "Remboursement demandé" pour les voir
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-medium text-muted-foreground">Total paiements</p>
          <p className="text-3xl font-bold">{data?.meta.total ?? 0}</p>
        </div>
        <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-muted-foreground">Payés</p>
          </div>
          <p className="text-3xl font-bold">
            {payments.filter((p) => p.status === 'succeeded').length}
          </p>
        </div>
        <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-medium text-muted-foreground">Remb. demandés</p>
          </div>
          <p className="text-3xl font-bold">{pendingRefunds}</p>
        </div>
        <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Remboursés</p>
          </div>
          <p className="text-3xl font-bold">
            {payments.filter((p) => p.status === 'refunded').length}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher par nom ou email..."
          className="sm:w-64"
        />
        <FilterDropdown
          config={{
            key: 'status',
            label: 'Statut',
            type: 'select',
            options: statusFilters,
          }}
          value={status ? { select: status } : undefined}
          onChange={(value) => setStatus(value.select)}
          onClear={() => setStatus(undefined)}
        />
        <FilterDropdown
          config={{
            key: 'paymentMethod',
            label: 'Mode de paiement',
            type: 'select',
            options: paymentMethodFilters,
          }}
          value={paymentMethodFilter ? { select: paymentMethodFilter } : undefined}
          onChange={(value) => setPaymentMethodFilter(value.select)}
          onClear={() => setPaymentMethodFilter(undefined)}
        />
      </div>

      {/* Table */}
      {payments.length === 0 ? (
        <div className="bg-secondary border-2 border-dashed border-foreground p-8 text-center">
          <p className="font-bold text-muted-foreground">Aucun paiement trouvé</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <thead>
              <tr className="border-b-2 border-foreground bg-secondary">
                <th className="px-4 py-3 text-left font-bold">Inscripteur</th>
                <th className="px-4 py-3 text-left font-bold">Montant</th>
                <th className="px-4 py-3 text-left font-bold">Mode</th>
                <th className="px-4 py-3 text-left font-bold">Date</th>
                <th className="px-4 py-3 text-left font-bold">Statut</th>
                <th className="px-4 py-3 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr
                  key={payment.id}
                  onClick={() => setDetailsPayment(payment)}
                  className={`border-b border-foreground/20 transition-colors hover:bg-secondary/50 cursor-pointer ${index === payments.length - 1 ? 'border-b-0' : ''
                    }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{getSubscriberName(payment)}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.subscriber.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold">{formatPrice(payment.amount / 100)} €</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${paymentMethodColors[payment.paymentMethod] || 'bg-gray-200 text-gray-900 border-gray-600'}`}
                    >
                      {paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDateTime(payment.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${statusColors[payment.status]}`}
                    >
                      {statusLabels[payment.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
                            setCollectPayment(payment)
                          }}
                        >
                          <Banknote className="h-4 w-4 mr-1" />
                          Encaisser
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
        open={collectPayment !== null}
        onOpenChange={(open) => !open && setCollectPayment(null)}
        payment={collectPayment}
        onConfirm={() => {
          if (collectPayment) {
            collectMutation.mutate(collectPayment.id, {
              onSuccess: () => setCollectPayment(null),
            })
          }
        }}
        isLoading={collectMutation.isPending}
      />
    </div>
  )
}
