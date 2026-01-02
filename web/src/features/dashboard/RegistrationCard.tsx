import { useState } from 'react'
import type { Registration, RegistrationStatus } from './types'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { useCancelRegistration } from './hooks'
import { useCreatePaymentIntent } from '../payment'
import { formatDate, formatTime, formatPrice } from '../../lib/formatters'
import { toast } from 'sonner'
import { Calendar, Clock, Users, MapPin, CreditCard, Hash } from 'lucide-react'

interface RegistrationCardProps {
  registration: Registration
}

const statusColors: Record<RegistrationStatus, string> = {
  pending_payment: 'bg-yellow-200 text-yellow-900 border-yellow-600',
  paid: 'bg-green-200 text-green-900 border-green-600',
  waitlist: 'bg-orange-200 text-orange-900 border-orange-600',
  cancelled: 'bg-secondary text-muted-foreground border-foreground/50',
}

const statusLabels: Record<RegistrationStatus, string> = {
  pending_payment: 'En attente de paiement',
  paid: 'Payé',
  waitlist: "Liste d'attente",
  cancelled: 'Annulé',
}

export function RegistrationCard({ registration }: RegistrationCardProps) {
  const cancelMutation = useCancelRegistration()
  const paymentMutation = useCreatePaymentIntent()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)

  const handleConfirmCancel = () => {
    cancelMutation.mutate(registration.id, {
      onSuccess: () => setCancelDialogOpen(false),
    })
  }

  const handlePayment = () => {
    paymentMutation.mutate([registration.id], {
      onSuccess: (data) => {
        setPayDialogOpen(false)
        window.location.href = data.redirectUrl
      },
      onError: (error) => {
        toast.error('Erreur lors de la création du paiement: ' + error.message)
      },
    })
  }

  return (
    <>
      <div className="bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="text-xl font-bold">{registration.table.name}</h3>
              <span
                className={`inline-flex items-center px-3 py-1 text-xs font-bold border-2 ${statusColors[registration.status]}`}
              >
                {statusLabels[registration.status]}
                {registration.status === 'waitlist' &&
                  registration.waitlistRank &&
                  ` #${registration.waitlistRank}`}
              </span>
              {registration.bibNumber && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold border-2 bg-primary/10 text-primary border-primary/50">
                  <Hash className="w-3 h-3" />
                  Dossard {registration.bibNumber}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {registration.table.tournament.name}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formatDate(registration.table.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{formatTime(registration.table.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  {registration.table.pointsMin} - {registration.table.pointsMax} pts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="font-bold">{formatPrice(registration.table.price)} €</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-secondary/50 border-2 border-foreground/20">
              <div className="text-sm">
                <span className="font-bold">Joueur :</span> {registration.player.firstName}{' '}
                {registration.player.lastName}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {registration.player.club}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col gap-2 w-full md:w-auto">
            {registration.status === 'pending_payment' && (
              <Button onClick={() => setPayDialogOpen(true)} className="flex-1 md:flex-none">
                Payer
              </Button>
            )}
            {registration.status !== 'cancelled' && (
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(true)}
                disabled={cancelMutation.isPending}
                className="flex-1 md:flex-none"
              >
                {cancelMutation.isPending ? 'Annulation...' : 'Se désinscrire'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la désinscription</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cette inscription pour la table "
              {registration.table.name}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setCancelDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              variant="destructive"
            >
              {cancelMutation.isPending ? 'Annulation...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le paiement</DialogTitle>
            <DialogDescription>
              Vous allez être redirigé vers HelloAsso pour payer{' '}
              {formatPrice(registration.table.price)} € pour la table "{registration.table.name}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setPayDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePayment} disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? 'Redirection...' : 'Payer maintenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
