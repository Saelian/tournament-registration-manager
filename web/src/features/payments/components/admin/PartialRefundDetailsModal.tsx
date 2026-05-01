import { User, TableProperties } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@components/ui/dialog'
import { formatDateTime, formatPrice } from '../../../../lib/formatters'
import type { PartialRefund } from '../../types'
import { REFUND_METHOD_LABELS } from '@constants/status-mappings'
import { getSubscriberName } from '../../../../lib/formatting-helpers'

interface PartialRefundDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: PartialRefund | null
}

export function PartialRefundDetailsModal({ open, onOpenChange, entry }: PartialRefundDetailsModalProps) {
  if (!entry) return null

  const subscriberName = getSubscriberName(entry.subscriber)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TableProperties className="h-5 w-5" />
            Remboursement partiel — {entry.tableName}
          </DialogTitle>
          <DialogDescription>
            Annulation admin du {formatDateTime(entry.cancelledAt)}
            {entry.cancelledByAdminName && ` par ${entry.cancelledByAdminName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Montant */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 border-2 border-foreground/20 p-4">
              <p className="text-sm text-muted-foreground mb-1">Montant remboursé</p>
              <p className="text-2xl font-bold">{formatPrice(entry.amountCents / 100)} €</p>
            </div>
            <div className="bg-secondary/30 border-2 border-foreground/20 p-4">
              <p className="text-sm text-muted-foreground mb-1">Statut</p>
              {entry.refundStatus === 'done' ? (
                <span className="inline-flex items-center px-2 py-1 text-sm font-bold border bg-teal-100 text-teal-900 border-teal-600">
                  Traité
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 text-sm font-bold border bg-orange-100 text-orange-900 border-orange-600">
                  À traiter
                </span>
              )}
            </div>
          </div>

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
                <span className="font-medium">{entry.subscriber.email}</span>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Joueur :</span>{' '}
              <span className="font-medium">
                {entry.playerName} — {entry.playerLicence}
              </span>
            </div>
          </div>

          {/* Remboursement effectué */}
          {entry.refundStatus === 'done' && entry.refundedAt && (
            <div className="border-2 border-teal-300 bg-teal-50 p-4">
              <h3 className="font-bold mb-2 text-teal-900">Remboursement effectué</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-teal-700">Date :</span>{' '}
                  <span className="font-medium">{formatDateTime(entry.refundedAt)}</span>
                </div>
                <div>
                  <span className="text-teal-700">Mode :</span>{' '}
                  <span className="font-medium">
                    {entry.refundMethod ? (REFUND_METHOD_LABELS[entry.refundMethod] ?? entry.refundMethod) : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
