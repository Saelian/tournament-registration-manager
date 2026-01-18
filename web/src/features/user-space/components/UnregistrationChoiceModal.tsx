import { useState } from 'react'
import type { Registration } from '../types'
import type { Payment } from '../../payments/types'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { useCancelRegistration } from '../hooks'
import { useRequestRefund } from '../../payments/hooks'
import { formatPrice } from '../../../lib/formatters'
import { toast } from 'sonner'
import { AlertTriangle, Ban, RefreshCcw } from 'lucide-react'

interface UnregistrationChoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registration: Registration
  payment: Payment
}

export function UnregistrationChoiceModal({
  open,
  onOpenChange,
  registration,
  payment,
}: UnregistrationChoiceModalProps) {
  const [choice, setChoice] = useState<'unregister' | 'refund' | null>(null)
  const cancelMutation = useCancelRegistration()
  const refundMutation = useRequestRefund()

  const activeRegistrations = payment.registrations?.filter((r) => r.status !== 'cancelled') || []
  const canRefund = (payment.status === 'succeeded' || payment.status === 'refund_failed') && payment.helloassoPaymentId
  const isRefundRetry = payment.status === 'refund_failed'

  const handleClose = () => {
    setChoice(null)
    onOpenChange(false)
  }

  const handleUnregister = () => {
    cancelMutation.mutate(registration.id, {
      onSuccess: () => {
        toast.success('Désinscription effectuée')
        handleClose()
      },
      onError: (error) => {
        toast.error('Erreur: ' + error.message)
      },
    })
  }

  const handleRefund = () => {
    refundMutation.mutate(payment.id, {
      onSuccess: () => {
        toast.success('Remboursement demandé avec succès')
        handleClose()
      },
      onError: (error) => {
        toast.error('Erreur: ' + error.message)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Se désinscrire de {registration.table.name}</DialogTitle>
          <DialogDescription>Choisissez comment vous souhaitez vous désinscrire de ce tableau.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Option 1: Unregister without refund */}
          <button
            type="button"
            onClick={() => setChoice('unregister')}
            className={`w-full p-4 border-2 text-left transition-colors ${
              choice === 'unregister'
                ? 'border-primary bg-primary/10'
                : 'border-foreground/30 hover:border-foreground/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary flex items-center justify-center border-2 border-foreground shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">Désinscription seule</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Vous vous désinscrivez de ce tableau uniquement. <strong>Aucun remboursement</strong> ne sera
                  effectué. La place sera libérée pour un autre joueur.
                </div>
              </div>
            </div>
          </button>

          {/* Option 2: Full refund */}
          {canRefund && (
            <button
              type="button"
              onClick={() => setChoice('refund')}
              className={`w-full p-4 border-2 text-left transition-colors ${
                choice === 'refund' ? 'border-primary bg-primary/10' : 'border-foreground/30 hover:border-foreground/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 flex items-center justify-center border-2 border-foreground shrink-0">
                  <RefreshCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold">{isRefundRetry ? 'Retenter le remboursement' : 'Remboursement total'}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {isRefundRetry
                      ? `Le remboursement précédent a échoué. Retenter pour ${formatPrice(payment.amount / 100)} €.`
                      : `Vous demandez un remboursement complet de ${formatPrice(payment.amount / 100)} €.`}
                  </div>
                  {activeRegistrations.length > 1 && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Attention :</strong> Toutes vos inscriptions liées à ce paiement seront annulées (
                        {activeRegistrations.length} tableaux).
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          {choice === 'unregister' && (
            <Button onClick={handleUnregister} disabled={cancelMutation.isPending} variant="destructive">
              {cancelMutation.isPending ? 'Annulation...' : 'Confirmer la désinscription'}
            </Button>
          )}
          {choice === 'refund' && (
            <Button onClick={handleRefund} disabled={refundMutation.isPending}>
              {refundMutation.isPending
                ? 'Traitement...'
                : isRefundRetry
                  ? 'Retenter le remboursement'
                  : 'Demander le remboursement'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
