import { Link } from 'react-router-dom'
import { usePublicTournaments, usePublicTables, usePublicSponsors } from './hooks'
import {
  MapPinIcon,
  CalendarIcon,
  Users,
  Clock,
  TrophyIcon,
  GlobeIcon,
  Zap,
  Target,
  PartyPopper,
  ArrowRight,
  Star,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    })
  }

  const formatPointsRange = (min: number, max: number) => {
    if (min === 0 && max >= 4000) return 'Tous points'
    if (min === 0) return `< ${max} pts`
    if (max >= 4000) return `> ${min} pts`
    return `${min} - ${max} pts`
  }

  const dateDisplay =
    tournament.startDate === tournament.endDate
      ? formatShortDate(tournament.startDate)
      : `${formatShortDate(tournament.startDate)} - ${formatShortDate(tournament.endDate)}`

  // Calculs pour les statistiques
  const totalTables = tables?.length ?? 0
  const totalPlaces = tables?.reduce((acc, t) => acc + t.quota, 0) ?? 0
  const totalRegistered = tables?.reduce((acc, t) => acc + t.registeredCount, 0) ?? 0
  const remainingPlaces = totalPlaces - totalRegistered

  return (
    <div className="min-h-screen bg-grain">
      {/* === PREMIER BLOC AVEC DÉGRADÉ: Hero -> Stats -> Pourquoi participer === */}
      <div className="bg-gradient-secondary-to-white">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left content */}
              <div>
                {/* Badge inscriptions ouvertes - style post-it */}
                <div className="animate-on-load animate-slide-in-left inline-block mb-6 transform -rotate-2">
                  <div className="inline-flex items-center gap-2 bg-accent text-foreground px-4 py-2 font-black text-sm border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Star className="w-4 h-4" />
                    INSCRIPTIONS OUVERTES
                  </div>
                </div>

                {/* Title */}
                <h1 className="animate-on-load animate-slide-up animation-delay-100 text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  {tournament.name}
                </h1>

                {/* Description */}
                {tournament.shortDescription && (
                  <div className="animate-on-load animate-slide-up animation-delay-200 text-lg text-muted-foreground mb-8 max-w-xl">
                    <MarkdownRenderer content={tournament.shortDescription} />
                  </div>
                )}

                {/* Date and Location badges */}
                <div className="animate-on-load animate-slide-up animation-delay-300 flex flex-wrap gap-3 mb-8">
                  <div className="flex items-center gap-3 bg-card p-4 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Date</div>
                      <div className="font-bold">{dateDisplay}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-card p-4 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <MapPinIcon className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Lieu</div>
                      <div className="font-bold">{tournament.location}</div>
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="animate-on-load animate-slide-up animation-delay-400 flex flex-wrap gap-4">
                  <Link to={`/tournaments/${tournament.id}/tables`}>
                    <Button size="lg" className="gap-2">
                      Je m'inscris maintenant
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <a href="#tableaux">
                    <Button size="lg" variant="outline" className="gap-2">
                      Voir les tableaux
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Right content - Places counter card */}
              <div className="animate-on-load animate-slide-in-right animation-delay-300 flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Badge nombre de tableaux - effet post-it oblique */}
                  <div className="absolute -top-4 -right-6 z-10 transform rotate-6">
                    <div className="bg-accent text-foreground px-4 py-2 font-black text-sm border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      {totalTables} TABLEAUX
                    </div>
                  </div>

                  {/* Main card */}
                  <div className="bg-card p-8 border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-64">
                    {/* Number */}
                    <div className="text-center">
                      <div className="animate-count-up text-5xl font-black text-primary">
                        {remainingPlaces}
                      </div>
                      <div className="text-muted-foreground font-medium">places disponibles</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Band - au-dessus du dégradé avec fond opaque */}
        <section className="bg-foreground text-background py-8 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div className="animate-on-load animate-scale-in animation-delay-100">
                <TrophyIcon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl md:text-4xl font-black">{totalTables}</div>
                <div className="text-sm uppercase tracking-wide opacity-80">Tableaux</div>
              </div>
              <div className="animate-on-load animate-scale-in animation-delay-200">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl md:text-4xl font-black">{totalPlaces}</div>
                <div className="text-sm uppercase tracking-wide opacity-80">Places totales</div>
              </div>
              <div className="animate-on-load animate-scale-in animation-delay-300">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl md:text-4xl font-black">{remainingPlaces}</div>
                <div className="text-sm uppercase tracking-wide opacity-80">Places restantes</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Participate Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="animate-on-load animate-slide-up text-3xl md:text-4xl font-black mb-4">
                Pourquoi participer ?
              </h2>
              <p className="animate-on-load animate-slide-up animation-delay-100 text-muted-foreground text-lg">
                Rejoignez-nous pour une compétition de qualité dans une ambiance conviviale
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="animate-on-load animate-slide-up animation-delay-200 bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all">
                <div className="w-12 h-12 bg-primary flex items-center justify-center mb-4">
                  <TrophyIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Compétition officielle</h3>
                <p className="text-muted-foreground text-sm">
                  Tournoi homologué FFTT avec classement officiel
                </p>
              </div>

              {/* Card 2 */}
              <div className="animate-on-load animate-slide-up animation-delay-300 bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all">
                <div className="w-12 h-12 bg-accent flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Inscription rapide</h3>
                <p className="text-muted-foreground text-sm">
                  Inscrivez-vous en quelques clics, c'est simple !
                </p>
              </div>

              {/* Card 3 */}
              <div className="animate-on-load animate-slide-up animation-delay-400 bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all">
                <div className="w-12 h-12 bg-accent flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Tous niveaux</h3>
                <p className="text-muted-foreground text-sm">
                  Des tableaux adaptés à chaque niveau de jeu
                </p>
              </div>

              {/* Card 4 */}
              <div className="animate-on-load animate-slide-up animation-delay-500 bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all">
                <div className="w-12 h-12 bg-primary flex items-center justify-center mb-4">
                  <PartyPopper className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Ambiance conviviale</h3>
                <p className="text-muted-foreground text-sm">
                  Un événement sportif dans une atmosphère chaleureuse
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* === FIN PREMIER BLOC DÉGRADÉ === */}

      {/* === SECOND BLOC AVEC DÉGRADÉ: Tableaux -> Sponsors -> Infos -> Liens === */}
      <div className="bg-gradient-secondary-to-white border-t-4 border-primary">
        {/* Tables Section */}
        <section id="tableaux" className="pt-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="animate-on-load animate-slide-up text-3xl md:text-4xl font-black mb-4">
                Choisissez votre tableau
              </h2>
              <p className="animate-on-load animate-slide-up animation-delay-100 text-muted-foreground text-lg mb-6">
                Des catégories pour tous les niveaux, trouvez celle qui vous correspond
              </p>
              <Link to={`/tournaments/${tournament.id}/tables`}>
                <Button size="lg" className="animate-on-load animate-scale-in animation-delay-200 gap-2">
                  Je m'inscris maintenant
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {isLoadingTables ? (
              <div className="p-8 text-center animate-pulse">Chargement des tableaux...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables
                  ?.slice()
                  .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
                  .map((table: Table, index: number) => {
                  const remaining = table.quota - table.registeredCount
                  const isFull = remaining <= 0
                  const delayClass = `animation-delay-${((index % 6) + 1) * 100}`

                  return (
                    <div
                      key={table.id}
                      className={`animate-on-load animate-slide-up ${delayClass} bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all`}
                    >
                      {/* Header with border */}
                      <div className="p-4 border-b-2 border-foreground bg-muted/30">
                        <h3 className="font-bold text-lg">{table.name}</h3>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>
                            {formatDate(table.date)} à {table.startTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-primary" />
                          <span>{formatPointsRange(table.pointsMin, table.pointsMax)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span className={isFull ? 'text-destructive font-bold' : ''}>
                            {isFull ? 'Complet' : `${remaining} places sur ${table.quota}`}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t-2 border-foreground flex items-center justify-between">
                        <div className="text-2xl font-black">{table.price}€</div>
                        {table.totalCashPrize > 0 ? (
                          <div className="flex items-center gap-1 text-sm font-bold text-primary">
                            <TrophyIcon className="w-4 h-4" />
                            {table.totalCashPrize}€ de prix
                          </div>
                        ) : table.prizes?.some((p) => p.prizeType === 'item') ? (
                          <div className="flex items-center gap-1 text-sm font-bold text-primary">
                            <TrophyIcon className="w-4 h-4" />
                            Lots à gagner
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Sponsors Section */}
        {globalSponsors.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-6">
              <div className="animate-on-load animate-slide-up bg-accent p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-600" />
                  Sponsors officiels
                </h2>
                <div className="flex flex-wrap gap-4">
                  {globalSponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="bg-card p-4 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3"
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
            </div>
          </section>
        )}

        {/* Long Description Section */}
        {tournament.longDescription && (
          <section>
            <div className="max-w-7xl mx-auto px-6">
              <div className="animate-on-load animate-slide-up bg-card p-8 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Informations importantes
                </h2>
                <MarkdownRenderer content={tournament.longDescription} />
              </div>
            </div>
          </section>
        )}

        {/* Links Section */}
        {(tournament.rulesLink || tournament.ffttHomologationLink) && (
          <section className="py-8">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-wrap justify-center gap-4">
                {tournament.rulesLink && (
                  <a href={tournament.rulesLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white relative z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Règlement du tournoi
                    </Button>
                  </a>
                )}
                {tournament.ffttHomologationLink && (
                  <a
                    href={tournament.ffttHomologationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white relative z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Homologation FFTT
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      {/* === FIN SECOND BLOC DÉGRADÉ === */}

      {/* Final CTA Section */}
      <section className="bg-primary py-16 border-t-4 border-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="animate-on-load animate-slide-up text-3xl md:text-4xl font-black text-primary-foreground mb-4">
            Prêt à relever le défi ?
          </h2>
          <p className="animate-on-load animate-slide-up animation-delay-100 text-primary-foreground/80 text-lg mb-8">
            Ne manquez pas cette occasion de montrer votre talent sur la table !
          </p>
          <Link to={`/tournaments/${tournament.id}/tables`}>
            <Button
              size="lg"
              variant="secondary"
              className="animate-on-load animate-scale-in animation-delay-200 gap-2 text-lg px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
            >
              S'inscrire maintenant
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
