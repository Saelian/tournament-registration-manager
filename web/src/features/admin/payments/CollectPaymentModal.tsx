import { Banknote, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { formatPrice } from '../../../lib/formatters'
import type { PaymentData } from './types'
import { PAYMENT_METHOD_LABELS } from '@constants/status-mappings'
import { getSubscriberName } from '../../../lib/formatting-helpers'

interface CollectPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: PaymentData | null
  onConfirm: () => void
  isLoading: boolean
}

export function CollectPaymentModal({
  open,
  onOpenChange,
  payment,
  onConfirm,
  isLoading,
}: CollectPaymentModalProps) {
  if (!payment) return null

  const subscriberName = getSubscriberName(payment.subscriber)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] neo-brutal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Confirmer l'encaissement
          </DialogTitle>
          <DialogDescription>
            Vous allez marquer ce paiement comme encaissé. Cette action confirmera les inscriptions
            associées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 border-2 border-foreground p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inscripteur:</span>
              <span className="font-medium">{subscriberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant:</span>
              <span className="font-bold">{formatPrice(payment.amount / 100)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode de paiement:</span>
              <span className="font-medium">
                {PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inscriptions:</span>
              <span className="font-medium">{payment.registrationsCount} tableau(x)</span>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 p-3 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              En confirmant, vous attestez avoir reçu le paiement en{' '}
              {PAYMENT_METHOD_LABELS[payment.paymentMethod]?.toLowerCase() || payment.paymentMethod}
              .
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Encaissement...
              </>
            ) : (
              <>
                <Banknote className="h-4 w-4 mr-2" />
                Confirmer l'encaissement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
