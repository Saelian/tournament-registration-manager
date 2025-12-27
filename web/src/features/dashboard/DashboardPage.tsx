import { useMyRegistrations } from './hooks'
import { RegistrationCard } from './RegistrationCard'
import { useUserAuth } from '../auth'

export function DashboardPage() {
  const { user } = useUserAuth()
  const { data: registrations, isLoading, error } = useMyRegistrations()

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
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Mes inscriptions
          </h3>
          
          {!registrations || registrations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Vous n'avez aucune inscription pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <RegistrationCard key={registration.id} registration={registration} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
