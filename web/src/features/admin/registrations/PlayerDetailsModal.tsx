import { User, Mail, Phone, CreditCard, LayoutList } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import type { AggregatedPlayerRow, RegistrationData } from './types'

interface PlayerDetailsModalProps {
  player: AggregatedPlayerRow | null
  allRegistrations: RegistrationData[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100)
}

function getStatusLabel(status: string): { label: string; className: string } {
  switch (status) {
    case 'paid':
      return { label: 'Confirmé', className: 'text-green-700' }
    case 'pending_payment':
      return { label: 'En attente de paiement', className: 'text-yellow-700' }
    case 'waitlist':
      return { label: "Liste d'attente", className: 'text-blue-700' }
    case 'cancelled':
      return { label: 'Annulé', className: 'text-red-700' }
    default:
      return { label: status, className: 'text-gray-700' }
  }
}

function getPaymentStatusLabel(status: string): { label: string; className: string } {
  switch (status) {
    case 'succeeded':
      return { label: 'Payé', className: 'text-green-700' }
    case 'pending':
      return { label: 'En attente', className: 'text-yellow-700' }
    case 'failed':
      return { label: 'Échoué', className: 'text-red-700' }
    case 'refunded':
      return { label: 'Remboursé', className: 'text-purple-700' }
    default:
      return { label: status, className: 'text-gray-700' }
  }
}

export function PlayerDetailsModal({
  player,
  allRegistrations,
  open,
  onOpenChange,
}: PlayerDetailsModalProps) {
  if (!player) return null

  // Get all registrations for this player (not just filtered by day)
  const playerRegistrations = allRegistrations.filter(
    (r) => r.player.id === player.playerId
  )

  // Get all tables with their statuses
  const allTables = playerRegistrations.map((r) => ({
    ...r.table,
    status: r.status,
  }))

  // Get all successful payments
  const payments = playerRegistrations
    .filter((r) => r.payment && r.payment.status === 'succeeded')
    .map((r) => r.payment!)
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails du joueur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Section Joueur */}
          <section className="space-y-2">
            <h3 className="font-bold text-sm uppercase text-muted-foreground border-b pb-1">
              Joueur
            </h3>
            <div className="space-y-1">
              <p className="text-lg font-bold">
                {player.firstName} {player.lastName.toUpperCase()}
              </p>
              {player.bibNumber && (
                <p className="font-mono text-primary font-bold">
                  Dossard #{player.bibNumber}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>
                  <span className="text-muted-foreground">Licence :</span>{' '}
                  <span className="font-mono">{player.licence}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Points :</span>{' '}
                  <span className="font-bold">{player.points}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>
                  <span className="text-muted-foreground">Club :</span> {player.club}
                </span>
                {player.category && (
                  <span>
                    <span className="text-muted-foreground">Cat. :</span> {player.category}
                  </span>
                )}
                {player.sex && (
                  <span>
                    <span className="text-muted-foreground">Sexe :</span>{' '}
                    {player.sex === 'M' ? 'Homme' : 'Femme'}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Section Contact Inscripteur */}
          <section className="space-y-2">
            <h3 className="font-bold text-sm uppercase text-muted-foreground border-b pb-1 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Inscripteur
            </h3>
            <div className="space-y-1 text-sm">
              {player.subscriber.firstName || player.subscriber.lastName ? (
                <p className="font-semibold">
                  {player.subscriber.firstName} {player.subscriber.lastName}
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${player.subscriber.email}`}
                  className="text-primary hover:underline"
                >
                  {player.subscriber.email}
                </a>
              </p>
              {player.subscriber.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${player.subscriber.phone}`}
                    className="text-primary hover:underline"
                  >
                    {player.subscriber.phone}
                  </a>
                </p>
              )}
            </div>
          </section>

          {/* Section Paiement */}
          <section className="space-y-2">
            <h3 className="font-bold text-sm uppercase text-muted-foreground border-b pb-1 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Paiement
            </h3>
            {payments.length > 0 ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Montant total :</span>{' '}
                  <span className="font-bold text-green-700">{formatCurrency(totalPaid)}</span>
                </p>
                {payments.map((payment) => {
                  const statusInfo = getPaymentStatusLabel(payment.status)
                  return (
                    <div
                      key={payment.id}
                      className="bg-secondary/50 p-2 border border-foreground/10"
                    >
                      <div className="flex justify-between">
                        <span className={`font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                        <span className="font-bold">{formatCurrency(payment.amount)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(payment.createdAt)}
                        {payment.helloassoOrderId && (
                          <span className="ml-2 font-mono">
                            Réf: {payment.helloassoOrderId}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun paiement enregistré</p>
            )}
          </section>

          {/* Section Tableaux */}
          <section className="space-y-2">
            <h3 className="font-bold text-sm uppercase text-muted-foreground border-b pb-1 flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              Tableaux inscrits ({allTables.length})
            </h3>
            <div className="space-y-2">
              {allTables
                .sort((a, b) => {
                  const dateCompare = a.date.localeCompare(b.date)
                  if (dateCompare !== 0) return dateCompare
                  return a.startTime.localeCompare(b.startTime)
                })
                .map((table) => {
                  const statusInfo = getStatusLabel(table.status)
                  return (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-2 bg-secondary/50 border border-foreground/10"
                    >
                      <div>
                        <p className="font-semibold">{table.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(table.date)} à {table.startTime}
                        </p>
                      </div>
                      <span className={`text-sm font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  )
                })}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
