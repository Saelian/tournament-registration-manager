import { useState, useMemo } from 'react'
import { useMyRegistrations } from './hooks'
import { RegistrationCard } from './RegistrationCard'
import { useUserAuth } from '../auth'
import type { RegistrationStatus } from './types'

const statusFilters: { value: RegistrationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'paid', label: 'Payé' },
  { value: 'pending_payment', label: 'En attente' },
  { value: 'waitlist', label: 'Liste d\'attente' },
  { value: 'cancelled', label: 'Annulé' },
]

export function DashboardPage() {
  const { user } = useUserAuth()
  const { data: registrations, isLoading, error } = useMyRegistrations()
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all')

  const filteredRegistrations = useMemo(() => {
    if (!registrations) return []
    if (statusFilter === 'all') return registrations
    return registrations.filter((r) => r.status === statusFilter)
  }, [registrations, statusFilter])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Une erreur est survenue lors du chargement de vos inscriptions.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Mon tableau de bord
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bonjour {user?.fullName || user?.email}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Mes inscriptions
            </h3>
            {registrations && registrations.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="status-filter" className="text-sm text-gray-500">
                  Filtrer par statut :
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
                  className="block rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {statusFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!registrations || registrations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Vous n'avez aucune inscription pour le moment.</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Aucune inscription avec ce statut.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <RegistrationCard key={registration.id} registration={registration} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
