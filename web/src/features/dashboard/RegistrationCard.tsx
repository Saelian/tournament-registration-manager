import type { Registration, RegistrationStatus } from './types'
import { Button } from '../../components/ui/button'
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

  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
      cancelMutation.mutate(registration.id)
    }
  }

  const handlePay = () => {
    // TODO: Implement payment logic
    console.log('Pay for registration', registration.id)
    alert('Le paiement sera disponible prochainement.')
  }

  return (
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
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
          >
            {cancelMutation.isPending ? 'Annulation...' : 'Se désinscrire'}
          </Button>
        )}
        
        {registration.status === 'pending_payment' && (
          <Button onClick={handlePay}>
            Payer
          </Button>
        )}
      </div>
    </div>
  )
}
