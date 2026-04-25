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
  onConfirm: (payload: AdminCancelPayload) => void
  isPending: boolean
}

const REFUND_OPTIONS = [
  { value: 'none', label: 'Pas de remboursement' },
  { value: 'requested', label: 'Remboursement à traiter' },
  { value: 'done', label: 'Remboursement déjà effectué' },
] as const

const REFUND_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'check', label: 'Chèque' },
  { value: 'bank_transfer', label: 'Virement' },
] as const

export function AdminCancelRegistrationModal({
  open,
  onOpenChange,
  tableName,
  onConfirm,
  isPending,
}: AdminCancelRegistrationModalProps) {
  const [refundStatus, setRefundStatus] = useState<'none' | 'requested' | 'done' | null>(null)
  const [refundMethod, setRefundMethod] = useState<'cash' | 'check' | 'bank_transfer' | null>(null)

  const canConfirm = refundStatus !== null && (refundStatus !== 'done' || refundMethod !== null)

  function handleConfirm() {
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
            Annuler ce tableau
          </DialogTitle>
          <DialogDescription>
            Annulation de <strong>{tableName}</strong>. Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase text-muted-foreground tracking-wide">Remboursement</Label>
            <div className="space-y-2">
              {REFUND_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-3 border-2 cursor-pointer hover:border-foreground transition-colors"
                  style={{ borderColor: refundStatus === opt.value ? 'hsl(var(--foreground))' : undefined }}
                >
                  <input
                    type="radio"
                    name="refundStatus"
                    value={opt.value}
                    checked={refundStatus === opt.value}
                    onChange={() => {
                      setRefundStatus(opt.value)
                      setRefundMethod(null)
                    }}
                    className="accent-foreground"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {refundStatus === 'done' && (
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
                Méthode de remboursement
              </Label>
              <div className="space-y-2">
                {REFUND_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className="flex items-center gap-3 p-3 border-2 cursor-pointer hover:border-foreground transition-colors"
                    style={{ borderColor: refundMethod === m.value ? 'hsl(var(--foreground))' : undefined }}
                  >
                    <input
                      type="radio"
                      name="refundMethod"
                      value={m.value}
                      checked={refundMethod === m.value}
                      onChange={() => setRefundMethod(m.value)}
                      className="accent-foreground"
                    />
                    <span className="text-sm font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

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
