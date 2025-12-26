import { useParams, Link } from 'react-router-dom'
import { usePublicTables } from './hooks'
import { ArrowLeftIcon, UsersIcon } from 'lucide-react'

export function PublicTableListPage() {
  const { tournamentId } = useParams()
  const { data: tables, isLoading } = usePublicTables(tournamentId)

  if (isLoading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Retour aux tournois
      </Link>

      <h1 className="text-3xl font-bold mb-8">Tableaux disponibles</h1>

      <div className="grid gap-4">
        {tables?.map((table) => {
           const fillRate = Math.min(
            100,
            Math.round((table.registeredCount / table.quota) * 100)
          )

          return (
            <div
              key={table.id}
              className="bg-card p-4 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{table.name}</h3>
                    {table.isSpecial && (
                      <span className="bg-yellow-300 text-xs px-2 py-1 font-bold border border-foreground rounded">
                        Spécial
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-bold">Date:</span> {table.date}
                    </div>
                    <div>
                      <span className="font-bold">Début:</span> {table.startTime}
                    </div>
                    <div>
                      <span className="font-bold">Points:</span>{' '}
                      {table.pointsMin} - {table.pointsMax}
                    </div>
                    <div>
                      <span className="font-bold">Prix:</span> {table.price / 100} €
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        Places: {table.registeredCount} / {table.quota}
                      </span>
                      <span>{fillRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary border border-foreground rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fillRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {tables?.length === 0 && (
          <div className="text-center p-8 bg-secondary border-2 border-dashed border-foreground">
            <p className="font-bold text-muted-foreground">
              Aucun tableau disponible pour ce tournoi.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
