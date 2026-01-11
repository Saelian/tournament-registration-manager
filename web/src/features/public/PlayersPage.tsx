import { useMemo } from 'react'
import { Users, LayoutList, Layers, Clock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { PageHeader } from '@components/ui/page-header'
import { usePublicTournaments, usePublicTables, usePublicRegistrations } from './hooks'
import { PublicPlayerTable } from './PublicPlayerTable'
import { Progress } from '@components/ui/progress'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@components/ui/accordion'

export function PlayersPage() {
  const { data: tournaments, isLoading: isLoadingTournaments } = usePublicTournaments()
  const activeTournament = tournaments?.[0]

  const { data: tables, isLoading: isLoadingTables } = usePublicTables(
    activeTournament?.id?.toString()
  )
  const { data: registrationData, isLoading: isLoadingRegistrations } = usePublicRegistrations()
  const allRegistrations = registrationData?.registrations
  const tournamentDays = registrationData?.tournamentDays ?? []

  // Filter only confirmed registrations (paid + pending_payment) for main table rendering
  const confirmedRegistrations = useMemo(() => {
    if (!allRegistrations) return []
    return allRegistrations.filter((r) => r.status === 'paid' || r.status === 'pending_payment')
  }, [allRegistrations])

  const registrationsByTable = useMemo(() => {
    if (!allRegistrations || !tables) return {}

    const acc: Record<
      number,
      { confirmed: typeof allRegistrations; waitlist: typeof allRegistrations }
    > = {}

    tables.forEach((table) => {
      const tableRegs = allRegistrations.filter((r) => r.table.id === table.id)
      acc[table.id] = {
        confirmed: tableRegs.filter((r) => r.status === 'paid' || r.status === 'pending_payment'),
        waitlist: tableRegs
          .filter((r) => r.status === 'waitlist')
          .sort((a, b) => (a.waitlistRank ?? 0) - (b.waitlistRank ?? 0)),
      }
    })

    return acc
  }, [allRegistrations, tables])

  const isLoading = isLoadingTournaments || isLoadingTables || isLoadingRegistrations

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

  if (!activeTournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border-2 border-destructive p-8 text-center rounded">
          <h2 className="text-2xl font-black uppercase text-destructive mb-2">
            Aucun tournoi actif
          </h2>
          <p className="font-bold">Revenez plus tard !</p>
        </div>
      </div>
    )
  }

  const sortedTables = tables ? [...tables].sort((a, b) => a.name.localeCompare(b.name)) : []

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title="Joueurs inscrits"
          description="Consultez la liste des joueurs inscrits au tournoi"
          icon={Users}
          backLink="/"
        />

        <Tabs
          defaultValue="all-players"
          className="w-full animate-on-load animate-slide-up animation-delay-300"
        >
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="all-players" className="w-full">
              <LayoutList className="h-4 w-4" />
              Tous les joueurs
            </TabsTrigger>
            <TabsTrigger value="by-table" className="w-full">
              <Layers className="h-4 w-4" />
              Par tableau
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-players">
            <PublicPlayerTable
              registrations={confirmedRegistrations}
              tournamentDays={tournamentDays}
              showDayFilter={true}
              showTableColumn={true}
            />
          </TabsContent>

          <TabsContent value="by-table">
            {sortedTables.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {sortedTables.map((table, index) => {
                  const tableData = registrationsByTable[table.id] || {
                    confirmed: [],
                    waitlist: [],
                  }
                  const confirmedCount = tableData.confirmed.length
                  const waitlistCount = tableData.waitlist.length
                  const max = table.quota
                  const percent = Math.min(100, (confirmedCount / max) * 100)

                  const delayStyle = { animationDelay: `${100 + index * 50}ms` }

                  return (
                    <AccordionItem
                      key={table.id}
                      value={`table-${table.id}`}
                      className="animate-on-load animate-slide-up"
                      style={delayStyle}
                    >
                      <AccordionTrigger className="flex-col md:flex-row md:items-center gap-4 p-4 md:p-6 hover:bg-secondary/20">
                        <div className="flex items-center gap-4 flex-1">
                          <Users className="text-primary h-6 w-6" />
                          <div className="text-left">
                            <h3 className="text-xl font-black uppercase leading-none mb-1">
                              {table.name}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium">
                              {table.pointsMax > 0 ? `${table.pointsMax} pts max` : 'Ouvert à tous'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className="flex-1 md:w-48 text-left">
                            <Progress
                              value={percent}
                              className="h-4 border-2 border-foreground/20 bg-secondary/30"
                              indicatorClassName={percent >= 100 ? 'bg-red-500' : 'bg-primary'}
                            />
                            <span className="text-sm">
                              {confirmedCount}/{max} inscrit{confirmedCount > 1 ? 's' : ''}
                              {waitlistCount > 0 && (
                                <span className="ml-2 text-orange-600">
                                  (+{waitlistCount} en attente)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="p-4 md:p-6 pt-0 space-y-6">
                        {/* Inscriptions confirmées */}
                        {tableData.confirmed.length > 0 ? (
                          <PublicPlayerTable
                            registrations={tableData.confirmed}
                            showDayFilter={false}
                            showTableColumn={false}
                          />
                        ) : (
                          <div className="text-center py-8 text-muted-foreground font-bold italic">
                            Aucun joueur inscrit dans ce tableau pour le moment.
                          </div>
                        )}

                        {/* Liste d'attente */}
                        {tableData.waitlist.length > 0 && (
                          <div className="mt-6 pt-4 border-t-2 border-foreground/10">
                            <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                              <Clock className="h-5 w-5 text-orange-500" />
                              Liste d'attente ({tableData.waitlist.length})
                            </h4>
                            <div className="space-y-2">
                              {tableData.waitlist.map((reg) => (
                                <div
                                  key={`${reg.player.licence}-${reg.table.id}`}
                                  className="flex items-center gap-4 p-3 bg-orange-50 border border-orange-200"
                                >
                                  <span className="font-bold text-orange-600 w-8">
                                    #{reg.waitlistRank}
                                  </span>
                                  <div className="flex-1">
                                    <span className="font-semibold">
                                      {reg.player.lastName.toUpperCase()}
                                    </span>{' '}
                                    <span>{reg.player.firstName}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      ({reg.player.points} pts)
                                    </span>
                                  </div>
                                  <span className="text-sm text-muted-foreground font-mono">
                                    {reg.player.licence}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-muted-foreground font-bold italic">
                Aucun tableau disponible.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
