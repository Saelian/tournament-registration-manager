import { Link } from 'react-router-dom'
import { usePublicTournaments, usePublicTables, usePublicSponsors } from './hooks'
import { MapPinIcon, CalendarIcon, Users, Clock, TrophyIcon, GlobeIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { DataTable, type Column } from '../../components/ui/data-table'
import { MarkdownRenderer } from '../../components/ui/markdown-renderer'
import type { Table } from '../tables/types'

export function LandingPage() {
  const { data: tournaments, isLoading: isLoadingTournament } = usePublicTournaments()
  const tournament = tournaments?.[0]

  const { data: tables, isLoading: isLoadingTables } = usePublicTables(tournament?.id?.toString())
  const { data: sponsors } = usePublicSponsors(tournament?.id?.toString())

  const globalSponsors = sponsors?.filter((s) => s.isGlobal) ?? []

  if (isLoadingTournament) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-secondary border-2 border-dashed border-foreground p-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Aucun tournoi en cours</h1>
          <p className="text-muted-foreground">
            Il n'y a pas de tournoi actif pour le moment. Revenez plus tard !
          </p>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatPointsRange = (min: number, max: number) => {
    if (min === 0 && max === 4000) return 'Tous points'
    if (min === 0) return `< ${max} pts`
    if (max === 4000) return `> ${min} pts`
    return `${min} - ${max} pts`
  }

  const getPlacesDisplay = (table: Table) => {
    const remaining = table.quota - table.registeredCount
    if (remaining <= 0) {
      return <span className="text-destructive font-bold">Complet</span>
    }
    return (
      <span className="flex items-center gap-1">
        <Users className="w-4 h-4" />
        {remaining}/{table.quota}
      </span>
    )
  }

  const columns: Column<Table>[] = [
    {
      key: 'name',
      header: 'Tableau',
      render: (table) => <span className="font-bold">{table.name}</span>,
    },
    {
      key: 'datetime',
      header: 'Date & Heure',
      render: (table) => (
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {new Date(table.date).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}{' '}
          à {table.startTime}
        </span>
      ),
    },
    {
      key: 'points',
      header: 'Points',
      render: (table) => formatPointsRange(table.pointsMin, table.pointsMax),
    },
    {
      key: 'places',
      header: 'Places',
      render: getPlacesDisplay,
    },
    {
      key: 'price',
      header: 'Prix',
      render: (table) => `${table.price}€`,
    },
    {
      key: 'prizes',
      header: 'Dotation',
      render: (table) => {
        if (table.totalCashPrize > 0) {
          return (
            <span className="flex items-center gap-1 text-yellow-700 font-bold">
              <TrophyIcon className="w-4 h-4" />
              {table.totalCashPrize}€
            </span>
          )
        }
        if (table.prizes?.length > 0) {
          return (
            <span className="text-muted-foreground text-xs">
              {table.prizes.length} lot{table.prizes.length > 1 ? 's' : ''}
            </span>
          )
        }
        return <span className="text-muted-foreground">-</span>
      },
    },
    {
      key: 'action',
      header: '',
      render: (table) => {
        const remaining = table.quota - table.registeredCount
        return (
          <Link to={`/tournaments/${tournament.id}/tables?table=${table.id}`}>
            <Button size="sm" variant={remaining <= 0 ? 'secondary' : 'default'}>
              {remaining <= 0 ? "Liste d'attente" : "S'inscrire"}
            </Button>
          </Link>
        )
      },
      className: 'text-right',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* En-tête du tournoi */}
      <div className="bg-card p-8 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-bold mb-6">{tournament.name}</h1>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold">Dates</div>
              <div className="text-sm">
                {formatDate(tournament.startDate)}
                {tournament.startDate !== tournament.endDate && (
                  <> au {formatDate(tournament.endDate)}</>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPinIcon className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold">Lieu</div>
              <div className="text-sm">{tournament.location}</div>
            </div>
          </div>
        </div>

        {tournament.shortDescription && (
          <p className="text-muted-foreground">{tournament.shortDescription}</p>
        )}
      </div>

      {/* Sponsors globaux */}
      {globalSponsors.length > 0 && (
        <div className="bg-yellow-50 p-6 border-2 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-600" />
            Sponsors officiels
          </h2>
          <div className="flex flex-wrap gap-4">
            {globalSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-white p-4 border-2 border-foreground rounded-lg flex items-center gap-3"
              >
                <div>
                  <div className="font-bold">{sponsor.name}</div>
                  {sponsor.websiteUrl && (
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      <GlobeIcon className="w-3 h-3" />
                      Site web
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description longue */}
      {tournament.longDescription && (
        <div className="bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-bold mb-4">Informations</h2>
          <MarkdownRenderer content={tournament.longDescription} />
        </div>
      )}

      {/* Tableaux */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Tableaux</h2>
        {isLoadingTables ? (
          <div className="p-8 text-center animate-pulse">Chargement des tableaux...</div>
        ) : (
          <DataTable
            data={tables ?? []}
            columns={columns}
            keyExtractor={(table) => table.id}
            emptyMessage="Aucun tableau disponible"
          />
        )}
      </div>

      {/* Liens utiles */}
      {(tournament.rulesLink || tournament.ffttHomologationLink) && (
        <div className="flex flex-wrap gap-4">
          {tournament.rulesLink && (
            <a href={tournament.rulesLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Règlement</Button>
            </a>
          )}
          {tournament.ffttHomologationLink && (
            <a href={tournament.ffttHomologationLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Homologation FFTT</Button>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
