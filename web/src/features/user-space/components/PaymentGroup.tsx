import { useState } from 'react'
import type { Payment, PaymentStatus } from '../../payments/types'
import type { Registration } from '../types'
import { Button } from '@components/ui/button'
import { formatDate, formatDateTime, formatPrice } from '@lib/formatters'
import { Calendar, CreditCard, Receipt, Clock, Users, MapPin, AlertCircle, Hash, AlertTriangle } from 'lucide-react'
import { UnregistrationChoiceModal } from './UnregistrationChoiceModal'
import { RefundRequestModal } from './RefundRequestModal'
import { useCreatePaymentIntent } from '@features/payments/hooks'
import { toast } from 'sonner'
import { Badge } from '@components/ui/badge'

interface PaymentGroupProps {
  payment: Payment
  registrations: Registration[]
}

const paymentStatusVariants: Record<PaymentStatus, 'warning' | 'success' | 'error' | 'neutral' | 'info'> = {
  pending: 'warning',
  succeeded: 'success',
  failed: 'error',
  expired: 'neutral',
  refunded: 'info',
  refund_pending: 'info',
  refund_failed: 'error',
  refund_requested: 'warning',
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'En attente',
  succeeded: 'Payé',
  failed: 'Échec',
  expired: 'Expiré',
  refunded: 'Remboursé',
  refund_pending: 'Remboursement en cours',
  refund_failed: 'Remboursement échoué',
  refund_requested: 'Remboursement demandé',
}

export function PaymentGroup({ payment, registrations }: PaymentGroupProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const paymentMutation = useCreatePaymentIntent()

  const activeRegistrations = registrations.filter((r) => r.status !== 'cancelled')
  const canRequestRefund = payment.status === 'succeeded' && activeRegistrations.length > 0
  const isPending = payment.status === 'pending'

  const hasPromotedRegistration = registrations.some((r) => r.promotedAt !== null)
  const waitlistTimerHours = registrations[0]?.table.tournament.options?.waitlistTimerHours ?? 4

  const handlePay = () => {
    const pendingRegistrationIds = registrations.filter((r) => r.status === 'pending_payment').map((r) => r.id)
    if (pendingRegistrationIds.length === 0) {
      toast.error('Aucune inscription en attente de paiement')
      return
    }
    paymentMutation.mutate(pendingRegistrationIds, {
      onSuccess: (data) => {
        window.location.href = data.redirectUrl
      },
      onError: (error) => {
        toast.error('Erreur lors de la création du paiement: ' + error.message)
      },
    })
  }

  return (
    <>
      <div className="bg-card neo-brutal">
        {' '}
        {/* Payment Header */}
        <div className="p-4 border-b-2 border-foreground bg-secondary/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-foreground">
                <Receipt className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Paiement du {formatDateTime(payment.createdAt)}</span>
                  <Badge variant={paymentStatusVariants[payment.status]}>{paymentStatusLabels[payment.status]}</Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  {formatPrice(payment.amount / 100)} €
                </div>
              </div>
            </div>
            {canRequestRefund && (
              <Button variant="outline" size="sm" onClick={() => setRefundModalOpen(true)}>
                Demander un remboursement
              </Button>
            )}
            {isPending && (
              <Button onClick={handlePay} disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? 'Redirection...' : `Payer ${formatPrice(payment.amount / 100)} €`}
              </Button>
            )}
          </div>
        </div>
        {isPending && (
          <div className="mx-4 mt-4 p-3 bg-yellow-100 border-2 border-yellow-500 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0" />
            <p className="text-sm font-medium text-yellow-800">
              {hasPromotedRegistration ? (
                <>
                  Tout paiement non effectué dans les <span className="font-bold">{waitlistTimerHours}h</span> après la
                  promotion en tableau entraîne l'annulation automatique des inscriptions.
                </>
              ) : (
                "Tout paiement non effectué dans les 30 minutes après l'inscription entraîne l'annulation automatique des inscriptions."
              )}
            </p>
          </div>
        )}
        {/* Registrations */}
        <div className="p-4 space-y-3">
          {registrations.map((registration) => (
            <RegistrationRow
              key={registration.id}
              registration={registration}
              showUnregisterButton={registration.status === 'paid' || registration.status === 'waitlist'}
              onUnregister={() => setSelectedRegistration(registration)}
            />
          ))}
        </div>
      </div>

      {/* Unregistration Modal */}
      {selectedRegistration && (
        <UnregistrationChoiceModal
          open={!!selectedRegistration}
          onOpenChange={(open) => !open && setSelectedRegistration(null)}
          registration={selectedRegistration}
          payment={payment}
        />
      )}

      {/* Refund Modal */}
      <RefundRequestModal
        open={refundModalOpen}
        onOpenChange={setRefundModalOpen}
        payment={payment}
        registrations={activeRegistrations}
      />
    </>
  )
}

interface RegistrationRowProps {
  registration: Registration
  showUnregisterButton: boolean
  onUnregister: () => void
}

const registrationStatusColors: Record<string, string> = {
  pending_payment: 'bg-yellow-200 text-yellow-900 border-yellow-600',
  paid: 'bg-green-200 text-green-900 border-green-600',
  waitlist: 'bg-orange-200 text-orange-900 border-orange-600',
  cancelled: 'bg-secondary text-muted-foreground border-foreground/50',
}

const registrationStatusLabels: Record<string, string> = {
  pending_payment: 'En attente',
  paid: 'Confirmé',
  waitlist: "Liste d'attente",
  cancelled: 'Annulé',
}

function RegistrationRow({ registration, showUnregisterButton, onUnregister }: RegistrationRowProps) {
  const isCancelled = registration.status === 'cancelled'

  return (
    <div className={`p-4 border-2 border-foreground/30 ${isCancelled ? 'opacity-60 bg-secondary/20' : 'bg-card'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold">{registration.table.name}</h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${registrationStatusColors[registration.status]}`}
            >
              {registrationStatusLabels[registration.status]}
              {registration.status === 'waitlist' && registration.waitlistRank && ` #${registration.waitlistRank}`}
            </span>
            {registration.bibNumber && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border bg-primary/10 text-primary border-primary/50">
                <Hash className="w-3 h-3" />
                Dossard {registration.bibNumber}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(registration.table.date)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {registration.table.startTime}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {registration.player.firstName} {registration.player.lastName}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {registration.player.club}
            </div>
          </div>
        </div>
        {showUnregisterButton && (
          <Button variant="outline" size="sm" onClick={onUnregister}>
            Se désinscrire
          </Button>
        )}
      </div>
    </div>
  )
}

interface PendingPaymentGroupProps {
  registrations: Registration[]
}

export function PendingPaymentGroup({ registrations }: PendingPaymentGroupProps) {
  return (
    <div className="bg-card neo-brutal">
      {' '}
      {/* Header */}
      <div className="p-4 border-b-2 border-foreground bg-yellow-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 flex items-center justify-center border-2 border-foreground">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold">En attente de paiement</div>
            <div className="text-sm text-muted-foreground">
              {registrations.length} inscription{registrations.length > 1 ? 's' : ''} à payer
            </div>
          </div>
        </div>
      </div>
      {/* Registrations */}
      <div className="p-4 space-y-3">
        {registrations.map((registration) => (
          <PendingRegistrationRow key={registration.id} registration={registration} />
        ))}
      </div>
    </div>
  )
}

function PendingRegistrationRow({ registration }: { registration: Registration }) {
  return (
    <div className="p-4 border-2 border-yellow-400 bg-yellow-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-bold mb-2">{registration.table.name}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(registration.table.date)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {registration.table.startTime}
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {formatPrice(registration.table.price)} €
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {registration.player.firstName} {registration.player.lastName}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
