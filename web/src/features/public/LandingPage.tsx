import { Link } from 'react-router-dom'
import { usePublicTournaments, usePublicTables, usePublicSponsors } from './hooks'
import {
  MapPinIcon,
  CalendarIcon,
  Users,
  Clock,
  TrophyIcon,
  GlobeIcon,
  Search,
  ListChecks,
  CreditCard,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { SortableDataTable, type SortableColumn } from '../../components/ui/sortable-data-table'
import { MarkdownRenderer } from '../../components/ui/markdown-renderer'
import { Hero } from '../../components/ui/hero'
import { StepIndicator, StepsContainer } from '../../components/ui/step-indicator'
import { FAQ, type FAQItem } from '../../components/ui/faq'
import type { Table } from '../tables/types'

const faqItems: FAQItem[] = [
  {
    question: "Comment fonctionne la liste d'attente ?",
    answer:
      "Lorsqu'un tableau est complet, vous pouvez vous inscrire sur la liste d'attente. Si une place se libère, vous serez automatiquement notifié par email dans l'ordre d'inscription.",
  },
  {
    question: 'Puis-je me faire rembourser mon inscription ?',
    answer:
      "Le remboursement est possible jusqu'à 7 jours avant le début du tournoi. Passé ce délai, aucun remboursement ne sera effectué sauf cas de force majeure.",
  },
  {
    question: "Comment est calculé mon pointage pour l'éligibilité aux tableaux ?",
    answer:
      "Votre pointage officiel FFTT est récupéré automatiquement lors de la recherche de votre licence. C'est ce pointage qui détermine votre éligibilité aux différents tableaux.",
  },
  {
    question: "Puis-je m'inscrire à plusieurs tableaux ?",
    answer:
      'Oui, vous pouvez vous inscrire à autant de tableaux que vous le souhaitez, à condition de respecter les critères de points de chaque tableau. Attention aux horaires qui peuvent se chevaucher.',
  },
  {
    question: 'Quels moyens de paiement sont acceptés ?',
    answer:
      "Le paiement s'effectue par carte bancaire via notre plateforme sécurisée HelloAsso. Vous recevrez une confirmation par email dès que votre paiement sera validé.",
  },
]

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

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
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

  const columns: SortableColumn<Table>[] = [
    {
      key: 'name',
      header: 'Tableau',
      render: (table) => <span className="font-bold">{table.name}</span>,
      sortable: true,
    },
    {
      key: 'date',
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
      sortable: true,
    },
    {
      key: 'pointsMin',
      header: 'Points',
      render: (table) => formatPointsRange(table.pointsMin, table.pointsMax),
      sortable: true,
    },
    {
      key: 'registeredCount',
      header: 'Places',
      render: getPlacesDisplay,
      sortable: true,
    },
    {
      key: 'price',
      header: 'Prix',
      render: (table) => `${table.price}€`,
      sortable: true,
    },
    {
      key: 'totalCashPrize',
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
      sortable: true,
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
      sortable: false,
    },
  ]

  const dateDisplay =
    tournament.startDate === tournament.endDate
      ? formatShortDate(tournament.startDate)
      : `${formatShortDate(tournament.startDate)} - ${formatShortDate(tournament.endDate)}`

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Hero Section */}
      <Hero
        subtitle={dateDisplay}
        title={tournament.name}
        description={tournament.shortDescription || undefined}
        cta={
          <Link to={`/tournaments/${tournament.id}/tables`}>
            <Button size="lg">
              <Users className="w-5 h-5 mr-2" />
              S'inscrire maintenant
            </Button>
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="flex items-center gap-3 bg-secondary/50 p-3 border-2 border-foreground">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold text-sm">Dates</div>
              <div className="text-sm">
                {formatDate(tournament.startDate)}
                {tournament.startDate !== tournament.endDate && (
                  <> au {formatDate(tournament.endDate)}</>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-secondary/50 p-3 border-2 border-foreground">
            <MapPinIcon className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold text-sm">Lieu</div>
              <div className="text-sm">{tournament.location}</div>
            </div>
          </div>
        </div>
      </Hero>

      {/* Comment s'inscrire */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Comment s'inscrire ?</h2>
        <StepsContainer>
          <StepIndicator
            stepNumber={1}
            title="Rechercher votre licence"
            description="Entrez votre numéro de licence FFTT ou votre nom pour retrouver votre profil"
            icon={<Search className="w-6 h-6" />}
          />
          <StepIndicator
            stepNumber={2}
            title="Choisir vos tableaux"
            description="Sélectionnez les tableaux correspondant à votre classement et vos disponibilités"
            icon={<ListChecks className="w-6 h-6" />}
          />
          <StepIndicator
            stepNumber={3}
            title="Payer en ligne"
            description="Réglez votre inscription par carte bancaire via notre plateforme sécurisée"
            icon={<CreditCard className="w-6 h-6" />}
          />
        </StepsContainer>
      </section>

      {/* Sponsors globaux */}
      {globalSponsors.length > 0 && (
        <section className="bg-yellow-50 p-6 border-2 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-600" />
            Sponsors officiels
          </h2>
          <div className="flex flex-wrap gap-4">
            {globalSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-white p-4 border-2 border-foreground flex items-center gap-3"
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
        </section>
      )}

      {/* Description longue */}
      {tournament.longDescription && (
        <section className="bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-bold mb-4">Informations</h2>
          <MarkdownRenderer content={tournament.longDescription} />
        </section>
      )}

      {/* Tableaux */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Tableaux</h2>
        {isLoadingTables ? (
          <div className="p-8 text-center animate-pulse">Chargement des tableaux...</div>
        ) : (
          <SortableDataTable
            data={tables ?? []}
            columns={columns}
            keyExtractor={(table) => table.id}
            emptyMessage="Aucun tableau disponible"
            sortable
            searchable
            searchPlaceholder="Rechercher un tableau..."
            searchKeys={['name'] as (keyof Table)[]}
            filters={[
              {
                key: 'pointsMin',
                type: 'range',
                label: 'Points min',
                min: 0,
                max: 4000,
              },
            ]}
            initialSort={{ column: 'date', direction: 'asc' }}
          />
        )}
      </section>

      {/* FAQ */}
      <section>
        <FAQ title="Questions fréquentes" items={faqItems} />
      </section>

      {/* Liens utiles */}
      {(tournament.rulesLink || tournament.ffttHomologationLink) && (
        <section className="flex flex-wrap gap-4">
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
        </section>
      )}
    </div>
  )
}
