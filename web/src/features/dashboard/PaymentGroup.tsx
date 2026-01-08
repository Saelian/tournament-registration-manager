import { useState } from 'react'
import type { Payment, PaymentStatus } from '../payment/types'
import type { Registration } from './types'
import { Button } from '@components/ui/button'
import { formatDate, formatDateTime, formatPrice } from '@lib/formatters'
import {
  Calendar,
  CreditCard,
  Receipt,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  Hash,
} from 'lucide-react'
import { UnregistrationChoiceModal } from './UnregistrationChoiceModal'
import { RefundRequestModal } from './RefundRequestModal'

interface PaymentGroupProps {
  payment: Payment
  registrations: Registration[]
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-200 text-yellow-900 border-yellow-600',
  succeeded: 'bg-green-200 text-green-900 border-green-600',
  failed: 'bg-red-200 text-red-900 border-red-600',
  expired: 'bg-secondary text-muted-foreground border-foreground/50',
  refunded: 'bg-blue-200 text-blue-900 border-blue-600',
  refund_pending: 'bg-blue-100 text-blue-800 border-blue-500',
  refund_failed: 'bg-red-200 text-red-900 border-red-600',
  refund_requested: 'bg-orange-200 text-orange-900 border-orange-600',
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

  const activeRegistrations = registrations.filter((r) => r.status !== 'cancelled')
  const canRequestRefund = payment.status === 'succeeded' && activeRegistrations.length > 0

  return (
    <>
      <div className="bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${paymentStatusColors[payment.status]}`}
                  >
                    {paymentStatusLabels[payment.status]}
                  </span>
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
          </div>
        </div>

        {/* Registrations */}
        <div className="p-4 space-y-3">
          {registrations.map((registration) => (
            <RegistrationRow
              key={registration.id}
              registration={registration}
              showUnregisterButton={
                registration.status === 'paid' || registration.status === 'waitlist'
              }
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

function RegistrationRow({
  registration,
  showUnregisterButton,
  onUnregister,
}: RegistrationRowProps) {
  const isCancelled = registration.status === 'cancelled'

  return (
    <div
      className={`p-4 border-2 border-foreground/30 ${isCancelled ? 'opacity-60 bg-secondary/20' : 'bg-white'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold">{registration.table.name}</h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${registrationStatusColors[registration.status]}`}
            >
              {registrationStatusLabels[registration.status]}
              {registration.status === 'waitlist' &&
                registration.waitlistRank &&
                ` #${registration.waitlistRank}`}
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
    <div className="bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
