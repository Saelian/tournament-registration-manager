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

interface RegistrationCardProps {
  registration: Registration
}

const statusColors: Record<RegistrationStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  waitlist: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<RegistrationStatus, string> = {
  pending_payment: 'En attente de paiement',
  paid: 'Payé',
  waitlist: 'Liste d\'attente',
  cancelled: 'Annulé',
}

export function RegistrationCard({ registration }: RegistrationCardProps) {
  const cancelMutation = useCancelRegistration()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)

  const handleConfirmCancel = () => {
    cancelMutation.mutate(registration.id, {
      onSuccess: () => setCancelDialogOpen(false),
    })
  }

  return (
    <>
      <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {registration.table.tournament.name} - {registration.table.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(registration.table.startTime).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Joueur: <span className="font-semibold">{registration.player.firstName} {registration.player.lastName}</span> ({registration.player.club})
            </p>
            <p className="text-sm text-gray-700">
               Prix: {registration.table.price} €
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[registration.status]}`}>
            {statusLabels[registration.status]}
            {registration.status === 'waitlist' && registration.waitlistRank && ` (Rang ${registration.waitlistRank})`}
          </span>
        </div>

        <div className="mt-4 flex space-x-3">
          {registration.status !== 'cancelled' && (
            <Button
              variant="secondary"
              onClick={() => setCancelDialogOpen(true)}
              disabled={cancelMutation.isPending}
              className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
            >
              {cancelMutation.isPending ? 'Annulation...' : 'Se désinscrire'}
            </Button>
          )}

          {registration.status === 'pending_payment' && (
            <Button onClick={() => setPayDialogOpen(true)}>
              Payer
            </Button>
          )}
        </div>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la désinscription</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cette inscription pour la table "{registration.table.name}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setCancelDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelMutation.isPending ? 'Annulation...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paiement</DialogTitle>
            <DialogDescription>
              Le paiement en ligne sera disponible prochainement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setPayDialogOpen(false)}>
              Compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
