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
import type { AggregatedPlayerRow } from '../../types'
import type { AdminCancelPayload } from '../../api/adminApi'

interface AdminCancelPlayerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: AggregatedPlayerRow | null
  onConfirm: (payload: AdminCancelPayload) => void
  isPending: boolean
}

const REFUND_OPTIONS = [
  { value: 'none', label: 'Pas de remboursement' },
  { value: 'requested', label: 'Remboursement à traiter' },
  { value: 'done', label: 'Remboursement déjà effectué' },
] as const

const REFUND_METHODS = [
  { value: 'helloasso_manual', label: 'HelloAsso (manuel)' },
  { value: 'bank_transfer', label: 'Virement' },
  { value: 'cash', label: 'Espèces' },
] as const

export function AdminCancelPlayerModal({
  open,
  onOpenChange,
  player,
  onConfirm,
  isPending,
}: AdminCancelPlayerModalProps) {
  const [refundStatus, setRefundStatus] = useState<'none' | 'requested' | 'done' | null>(null)
  const [refundMethod, setRefundMethod] = useState<'helloasso_manual' | 'bank_transfer' | 'cash' | null>(null)

  if (!player) return null

  const activeTables = player.tables.filter((t) => {
    const status = player.registrationStatuses[t.id]
    return ['paid', 'waitlist'].includes(status)
  })

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
            Désinscrire le joueur
          </DialogTitle>
          <DialogDescription>
            Annulation de toutes les inscriptions de{' '}
            <strong>
              {player.firstName} {player.lastName.toUpperCase()}
            </strong>
            . Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
              Tableaux concernés ({activeTables.length})
            </p>
            <ul className="space-y-1">
              {activeTables.map((t) => (
                <li key={t.id} className="text-sm px-2 py-1 bg-muted/30 border border-foreground/10">
                  {t.name}
                </li>
              ))}
            </ul>
          </div>

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

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Fermer
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!canConfirm || isPending}>
            {isPending ? 'Annulation...' : `Désinscrire de ${activeTables.length} tableau(x)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
