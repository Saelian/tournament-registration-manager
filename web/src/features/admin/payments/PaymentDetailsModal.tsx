import { useState } from 'react'
import { Calendar, Clock, CreditCard, User, MapPin, Hash, Link2, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { formatDate, formatDateTime, formatPrice } from '../../../lib/formatters'
import { useRegeneratePaymentLink } from './hooks'
import type { PaymentData } from './types'

interface PaymentDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: PaymentData | null
}

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

const refundMethodLabels: Record<string, string> = {
  helloasso_manual: 'HelloAsso (manuel)',
  bank_transfer: 'Virement',
  cash: 'Espèces',
}

export function PaymentDetailsModal({ open, onOpenChange, payment }: PaymentDetailsModalProps) {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const regenerateMutation = useRegeneratePaymentLink()

  if (!payment) return null

  const subscriberName =
    payment.subscriber.firstName || payment.subscriber.lastName
      ? `${payment.subscriber.firstName ?? ''} ${payment.subscriber.lastName ?? ''}`.trim()
      : payment.subscriber.email

  // Can regenerate link if: HelloAsso payment, pending status, has pending_payment registrations
  const canRegenerateLink =
    payment.paymentMethod === 'helloasso' &&
    payment.status === 'pending' &&
    payment.registrations.some((r) => r.status === 'pending_payment')

  const handleRegenerateLink = () => {
    const pendingRegistration = payment.registrations.find((r) => r.status === 'pending_payment')
    if (!pendingRegistration) return

    regenerateMutation.mutate(pendingRegistration.id, {
      onSuccess: (data) => {
        setCheckoutUrl(data.checkoutUrl)
        toast.success('Lien de paiement généré avec succès')
      },
      onError: (error) => {
        toast.error(`Erreur: ${error.message}`)
      },
    })
  }

  const handleCopyLink = async () => {
    if (!checkoutUrl) return
    await navigator.clipboard.writeText(checkoutUrl)
    setCopied(true)
    toast.success('Lien copié !')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Détails du paiement #{payment.id}
          </DialogTitle>
          <DialogDescription>
            Paiement effectué le {formatDateTime(payment.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 border-2 border-foreground/20 p-4">
              <p className="text-sm text-muted-foreground mb-1">Montant</p>
              <p className="text-2xl font-bold">{formatPrice(payment.amount / 100)} €</p>
            </div>
            <div className="bg-secondary/30 border-2 border-foreground/20 p-4">
              <p className="text-sm text-muted-foreground mb-1">Statut</p>
              <span
                className={`inline-flex items-center px-2 py-1 text-sm font-bold border ${statusColors[payment.status]}`}
              >
                {statusLabels[payment.status]}
              </span>
            </div>
          </div>

          {/* Lien de paiement HelloAsso */}
          {canRegenerateLink && (
            <div className="border-2 border-purple-300 bg-purple-50 p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-purple-900">
                <Link2 className="h-4 w-4" />
                Lien de paiement HelloAsso
              </h3>
              {checkoutUrl ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={checkoutUrl}
                      readOnly
                      className="font-mono text-sm bg-white"
                    />
                    <Button onClick={handleCopyLink} variant="secondary" size="icon">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-purple-700">
                    Ce lien est valable pendant 24 heures. Envoyez-le au joueur pour qu'il puisse payer.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-purple-700 mb-3">
                    Le paiement est en attente. Vous pouvez générer un nouveau lien de paiement HelloAsso.
                  </p>
                  <Button
                    onClick={handleRegenerateLink}
                    disabled={regenerateMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {regenerateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Générer un lien de paiement
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Inscripteur */}
          <div className="border-2 border-foreground/20 p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Inscripteur
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nom :</span>{' '}
                <span className="font-medium">{subscriberName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email :</span>{' '}
                <span className="font-medium">{payment.subscriber.email}</span>
              </div>
              {payment.subscriber.phone && (
                <div>
                  <span className="text-muted-foreground">Téléphone :</span>{' '}
                  <span className="font-medium">{payment.subscriber.phone}</span>
                </div>
              )}
              {payment.helloassoOrderId && (
                <div>
                  <span className="text-muted-foreground">Réf. HelloAsso :</span>{' '}
                  <span className="font-medium font-mono text-xs">{payment.helloassoOrderId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations de remboursement */}
          {payment.refundedAt && (
            <div className="border-2 border-blue-300 bg-blue-50 p-4">
              <h3 className="font-bold mb-2 text-blue-900">Remboursement effectué</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Date :</span>{' '}
                  <span className="font-medium">{formatDateTime(payment.refundedAt)}</span>
                </div>
                <div>
                  <span className="text-blue-700">Mode :</span>{' '}
                  <span className="font-medium">
                    {payment.refundMethod
                      ? (refundMethodLabels[payment.refundMethod] ?? payment.refundMethod)
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Inscriptions */}
          <div>
            <h3 className="font-bold mb-3">Inscriptions ({payment.registrations.length})</h3>
            <div className="space-y-3">
              {payment.registrations.map((reg) => (
                <div
                  key={reg.id}
                  className={`border-2 p-4 ${
                    reg.status === 'cancelled'
                      ? 'border-foreground/20 bg-secondary/20 opacity-60'
                      : 'border-foreground/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Joueur */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">
                          {reg.player.firstName} {reg.player.lastName}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${registrationStatusColors[reg.status]}`}
                        >
                          {registrationStatusLabels[reg.status]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          Licence: {reg.player.licence}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {reg.player.club}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tableau */}
                  <div className="mt-3 pt-3 border-t border-foreground/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{reg.table.name}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(reg.table.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reg.table.startTime.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{formatPrice(reg.table.price)} €</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
