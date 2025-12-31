import type { Registration } from './types'
import type { Payment } from '../payment/types'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { useRequestRefund, useRefundEligibility } from '../payment/hooks'
import { formatPrice, formatDate } from '../../lib/formatters'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface RefundRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
  registrations: Registration[]
}

export function RefundRequestModal({
  open,
  onOpenChange,
  payment,
  registrations,
}: RefundRequestModalProps) {
  const refundMutation = useRequestRefund()
  const { data: eligibility, isLoading: checkingEligibility } = useRefundEligibility(open ? payment.id : null)

  const handleClose = () => {
    onOpenChange(false)
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

  const isEligible = eligibility?.eligible ?? false
  const deadlinePassed = eligibility?.deadlinePassed ?? false

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Demander un remboursement</DialogTitle>
          <DialogDescription>
            Vous demandez le remboursement du paiement du {formatDate(payment.createdAt)}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Loading state */}
          {checkingEligibility && (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2">Vérification de l'éligibilité...</span>
            </div>
          )}

          {/* Deadline passed */}
          {!checkingEligibility && deadlinePassed && (
            <div className="p-4 bg-red-100 border-2 border-red-400 text-red-800">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Remboursement impossible</div>
                  <div className="text-sm mt-1">{eligibility?.deadlineMessage}</div>
                </div>
              </div>
            </div>
          )}

          {/* Eligible */}
          {!checkingEligibility && isEligible && (
            <>
              {/* Summary */}
              <div className="p-4 bg-secondary/50 border-2 border-foreground/20">
                <div className="font-bold mb-2">Récapitulatif</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Montant à rembourser :</span>
                    <span className="font-bold">{formatPrice(payment.amount / 100)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tableaux concernés :</span>
                    <span className="font-bold">{registrations.length}</span>
                  </div>
                </div>
              </div>

              {/* List of tables */}
              <div className="space-y-2">
                <div className="text-sm font-bold">Inscriptions qui seront annulées :</div>
                <ul className="space-y-1 text-sm">
                  {registrations.map((reg) => (
                    <li key={reg.id} className="flex items-center gap-2 p-2 bg-secondary/30">
                      <span>• {reg.table.name}</span>
                      <span className="text-muted-foreground">
                        ({reg.player.firstName} {reg.player.lastName})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-100 border-2 border-yellow-400 text-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Action irréversible</div>
                    <div className="text-sm mt-1">
                      Une fois le remboursement confirmé, toutes les inscriptions ci-dessus seront
                      définitivement annulées. Le remboursement sera effectué sur le moyen de paiement
                      utilisé lors du paiement initial.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Success state (after mutation) */}
          {refundMutation.isSuccess && (
            <div className="p-4 bg-green-100 border-2 border-green-400 text-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Remboursement demandé</div>
                  <div className="text-sm mt-1">
                    Votre demande de remboursement a été traitée. Le remboursement sera effectué sous
                    quelques jours ouvrés.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={handleClose}>
            {refundMutation.isSuccess ? 'Fermer' : 'Annuler'}
          </Button>
          {!checkingEligibility && isEligible && !refundMutation.isSuccess && (
            <Button onClick={handleRefund} disabled={refundMutation.isPending} variant="destructive">
              {refundMutation.isPending ? 'Traitement...' : 'Confirmer le remboursement'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
