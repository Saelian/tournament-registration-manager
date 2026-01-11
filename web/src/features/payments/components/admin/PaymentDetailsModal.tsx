import { useState } from 'react'
import {
  Calendar,
  Clock,
  CreditCard,
  User,
  MapPin,
  Hash,
  Link2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { formatDate, formatDateTime, formatPrice } from '../../../../lib/formatters'
import { useRegeneratePaymentLink } from '../../hooks'
import type { PaymentData } from '../../types'
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS_SATURATED,
  REGISTRATION_STATUS_LABELS,
  REFUND_METHOD_LABELS,
} from '@constants/status-mappings'
import { getSubscriberName } from '../../../../lib/formatting-helpers'

interface PaymentDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: PaymentData | null
}

export function PaymentDetailsModal({ open, onOpenChange, payment }: PaymentDetailsModalProps) {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const regenerateMutation = useRegeneratePaymentLink()

  if (!payment) return null

  const subscriberName = getSubscriberName(payment.subscriber)

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
                className={`inline-flex items-center px-2 py-1 text-sm font-bold border ${PAYMENT_STATUS_COLORS[payment.status]}`}
              >
                {PAYMENT_STATUS_LABELS[payment.status]}
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
                    <Input value={checkoutUrl} readOnly className="font-mono text-sm bg-white" />
                    <Button onClick={handleCopyLink} variant="secondary" size="sm" className="px-2">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-purple-700">
                    Ce lien est valable pendant 24 heures. Envoyez-le au joueur pour qu'il puisse
                    payer.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-purple-700 mb-3">
                    Le paiement est en attente. Vous pouvez générer un nouveau lien de paiement
                    HelloAsso.
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
                      ? (REFUND_METHOD_LABELS[payment.refundMethod] ?? payment.refundMethod)
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
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${REGISTRATION_STATUS_COLORS_SATURATED[reg.status]}`}
                        >
                          {REGISTRATION_STATUS_LABELS[reg.status]}
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
