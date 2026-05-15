import { useState, useEffect } from 'react'
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
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { formatPrice } from '../../../../lib/formatters'
import type { PaymentData } from '../../types'
import { PAYMENT_METHOD_LABELS } from '@constants/status-mappings'
import { getSubscriberName } from '../../../../lib/formatting-helpers'

type OfflinePaymentMethod = 'cash' | 'card'

const OFFLINE_METHODS: { value: OfflinePaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Espèces' },
  { value: 'card', label: 'Carte bancaire (TPE)' },
]

interface CollectPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: PaymentData | null
  onConfirm: (paymentMethod: OfflinePaymentMethod) => void
  isLoading: boolean
}

export function CollectPaymentModal({ open, onOpenChange, payment, onConfirm, isLoading }: CollectPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<OfflinePaymentMethod>('cash')

  useEffect(() => {
    if (payment && (payment.paymentMethod === 'cash' || payment.paymentMethod === 'card')) {
      setSelectedMethod(payment.paymentMethod)
    } else {
      setSelectedMethod('cash')
    }
  }, [payment])

  if (!payment) return null

  const subscriberName = getSubscriberName(payment.subscriber)
  const methodLabel = OFFLINE_METHODS.find((m) => m.value === selectedMethod)?.label ?? selectedMethod

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] neo-brutal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Confirmer l'encaissement
          </DialogTitle>
          <DialogDescription>
            Vous allez marquer ce paiement comme encaissé. Cette action confirmera les inscriptions associées.
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
              <span className="text-muted-foreground">Inscriptions:</span>
              <span className="font-medium">{payment.registrationsCount} tableau(x)</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Mode de règlement encaissé</Label>
            <Select value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as OfflinePaymentMethod)}>
              <SelectTrigger id="payment-method" className="border-2 border-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFLINE_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 p-3 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              En confirmant, vous attestez avoir reçu le paiement en{' '}
              {methodLabel.toLowerCase()}.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={() => onConfirm(selectedMethod)} disabled={isLoading}>
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
