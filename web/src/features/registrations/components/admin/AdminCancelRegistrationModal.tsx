import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import type { AdminCancelPayload } from '../../api/adminApi'

interface AdminCancelRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
  registrationId: number
  status: 'paid' | 'waitlist'
  onConfirm: (payload: AdminCancelPayload) => void
  isPending: boolean
}

const REFUND_OPTIONS = [
  { value: 'none', label: 'Pas de remboursement' },
  { value: 'requested', label: 'Remboursement à traiter' },
  { value: 'done', label: 'Remboursement déjà effectué' },
] as const

const REFUND_METHODS = [
  { value: 'bank_transfer', label: 'Virement' },
  { value: 'cash', label: 'Espèces' },
] as const

export function AdminCancelRegistrationModal({
  open,
  onOpenChange,
  tableName,
  status,
  onConfirm,
  isPending,
}: AdminCancelRegistrationModalProps) {
  const [refundStatus, setRefundStatus] = useState<'none' | 'requested' | 'done' | null>(null)
  const [refundMethod, setRefundMethod] = useState<'bank_transfer' | 'cash' | null>(null)

  const isWaitlist = status === 'waitlist'
  const canConfirm = isWaitlist || (refundStatus !== null && (refundStatus !== 'done' || refundMethod !== null))

  function handleConfirm() {
    if (isWaitlist) {
      onConfirm({ refundStatus: 'none' })
      return
    }
    if (!refundStatus) return
    const payload: AdminCancelPayload = {
      refundStatus,
      ...(refundStatus === 'done' && refundMethod ? { refundMethod } : {}),
    }
    onConfirm(payload)
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setRefundStatus(null)
      setRefundMethod(null)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md neo-brutal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {isWaitlist ? "Retirer de la liste d'attente" : 'Annuler ce tableau'}
          </DialogTitle>
          <DialogDescription>
            {isWaitlist ? (
              <>
                Retrait de <strong>{tableName}</strong> de la liste d'attente. Cette action est irréversible.
              </>
            ) : (
              <>
                Annulation de <strong>{tableName}</strong>. Cette action est irréversible.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isWaitlist ? (
          <p className="text-sm text-muted-foreground py-2">
            Ce joueur est en liste d'attente et n'a pas effectué de paiement. Aucun remboursement n'est nécessaire.
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Remboursement</Label>
              <div className="flex flex-col gap-2">
                {REFUND_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={refundStatus === opt.value ? 'default' : 'secondary'}
                    className="justify-start"
                    onClick={() => {
                      setRefundStatus(opt.value)
                      setRefundMethod(null)
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {refundStatus === 'done' && (
              <div className="space-y-2">
                <Label>Méthode de remboursement</Label>
                <div className="grid grid-cols-3 gap-2">
                  {REFUND_METHODS.map((m) => (
                    <Button
                      key={m.value}
                      type="button"
                      variant={refundMethod === m.value ? 'default' : 'secondary'}
                      className="justify-start"
                      onClick={() => setRefundMethod(m.value)}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!canConfirm || isPending}>
            {isPending ? 'Annulation...' : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
