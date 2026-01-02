import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublicRegistrations } from './hooks'
import { PublicPlayerTable } from './PublicPlayerTable'

export function PublicPlayersPage() {
  const { data, isLoading, error } = usePublicRegistrations()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive p-4 rounded">
          <p className="text-destructive">
            Une erreur est survenue lors du chargement des inscriptions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          to="/"
          className="animate-on-load animate-slide-in-left text-primary hover:underline text-sm mb-4 inline-block"
        >
          ← Retour à l'accueil
        </Link>
        <h1 className="animate-on-load animate-slide-in-left animation-delay-100 text-3xl font-black mb-2 flex items-center gap-3">
          <Users className="h-8 w-8" />
          Joueurs inscrits
        </h1>
        <p className="animate-on-load animate-slide-in-left animation-delay-200 text-muted-foreground">
          Liste de tous les joueurs inscrits au tournoi
        </p>
      </div>

      {/* Tableau des joueurs */}
      <div className="animate-on-load animate-slide-up animation-delay-400">
        <PublicPlayerTable
          registrations={data?.registrations || []}
          tournamentDays={data?.tournamentDays || []}
          showDayFilter={true}
          showTableColumn={true}
        />
      </div>
    </div>
  )
}
