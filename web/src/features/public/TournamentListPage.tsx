import { Link } from 'react-router-dom'
import { usePublicTournaments } from './hooks'
import { MapPinIcon, CalendarIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'

export function TournamentListPage() {
  const { data: tournaments, isLoading } = usePublicTournaments()

  if (isLoading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Tournois disponibles</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {tournaments?.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-4">{tournament.name}</h2>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <span>
                  Du {new Date(tournament.startDate).toLocaleDateString()} au{' '}
                  {new Date(tournament.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                <span>{tournament.location}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/tournaments/${tournament.id}/tables`} className="flex-1">
                <Button className="w-full" variant="outline">Voir les tableaux</Button>
              </Link>
              <Link to={`/tournaments/${tournament.id}/register`} className="flex-1">
                <Button className="w-full">S'inscrire</Button>
              </Link>
            </div>
          </div>
        ))}

        {tournaments?.length === 0 && (
          <div className="col-span-full text-center p-8 bg-secondary border-2 border-dashed border-foreground">
            <p className="font-bold text-muted-foreground">
              Aucun tournoi disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
