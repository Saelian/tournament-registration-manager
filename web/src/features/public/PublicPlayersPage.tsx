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
        <Link to="/" className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Users className="h-8 w-8" />
          Joueurs inscrits
        </h1>
        <p className="text-muted-foreground">Liste de tous les joueurs inscrits au tournoi</p>
      </div>

      {/* Compteur total */}
      <div className="mb-6 p-4 bg-primary/10 border-2 border-primary rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">{data?.totalPlayers || 0}</span>
          <span className="text-muted-foreground">
            joueur{(data?.totalPlayers || 0) !== 1 ? 's' : ''} inscrit
            {(data?.totalPlayers || 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tableau des joueurs */}
      <PublicPlayerTable
        registrations={data?.registrations || []}
        tournamentDays={data?.tournamentDays || []}
        showDayFilter={true}
        showTableColumn={true}
      />
    </div>
  )
}
