import { useMemo } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown, Users } from 'lucide-react'
import { usePublicTournaments, usePublicTables, usePublicRegistrations } from './hooks'
import { PublicPlayerTable } from './PublicPlayerTable'
import { Progress } from '../../components/ui/progress'

export function PlayersByTablePage() {
  const { data: tournaments, isLoading: isLoadingTournaments } = usePublicTournaments()
  const activeTournament = tournaments?.[0]

  const { data: tables, isLoading: isLoadingTables } = usePublicTables(
    activeTournament?.id?.toString()
  )
  const { data: registrationData, isLoading: isLoadingRegistrations } = usePublicRegistrations()
  const allRegistrations = registrationData?.registrations

  const registrationsByTable = useMemo(() => {
    if (!allRegistrations || !tables) return {}

    const acc: Record<number, typeof allRegistrations> = {}

    tables.forEach((table) => {
      acc[table.id] = allRegistrations.filter((r) => r.table.id === table.id)
    })

    return acc
  }, [allRegistrations, tables])

  const isLoading = isLoadingTournaments || isLoadingTables || isLoadingRegistrations

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-xl font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!activeTournament || !tables) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 border-2 border-destructive p-8 text-center rounded">
          <h2 className="text-2xl font-black uppercase text-destructive mb-2">
            Aucun tournoi actif
          </h2>
          <p className="font-bold">Revenez plus tard !</p>
        </div>
      </div>
    )
  }

  const sortedTables = [...tables].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center animate-on-load animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
          Inscrits par <span className="text-primary">Tableau</span>
        </h1>
        <p className="text-xl font-bold text-muted-foreground">
          Consultez la liste des joueurs pour chaque tableau
        </p>
      </div>

      <AccordionPrimitive.Root type="single" collapsible className="space-y-4">
        {sortedTables.map((table, index) => {
          const tableRegistrations = registrationsByTable[table.id] || []
          const count = tableRegistrations.length
          const max = table.quota
          const percent = Math.min(100, (count / max) * 100)

          // Calculate delay based on index for staggered animation
          const delayStyle = { animationDelay: `${100 + index * 50}ms` }

          return (
            <AccordionPrimitive.Item
              key={table.id}
              value={`table-${table.id}`}
              className="animate-on-load animate-slide-up bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-lg group"
              style={delayStyle}
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger className="flex flex-1 flex-col md:flex-row md:items-center justify-between p-4 md:p-6 text-left transition-all hover:bg-secondary/20 [&[data-state=open]>div>svg]:rotate-180 gap-4">
                  {/* Table Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      <Users className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase leading-none mb-1">
                        {table.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {table.pointsMax > 0 ? `${table.pointsMax} pts max` : 'Ouvert à tous'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Chevon */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="flex-1 md:w-48">
                      <Progress
                        value={percent}
                        className="h-4 border-2 border-foreground/20 bg-secondary/30"
                        indicatorClassName={percent >= 100 ? "bg-red-500" : "bg-primary"}
                      />
                      {count}/{max} {count > 1 ? "inscrits" : "inscrit"}
                    </div>

                    <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-200" />
                  </div>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>

              <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="p-4 md:p-6 pt-0 border-t-2 border-foreground/10">
                  {tableRegistrations.length > 0 ? (
                    <PublicPlayerTable
                      registrations={tableRegistrations}
                      showDayFilter={false}
                      showTableColumn={false}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground font-bold italic">
                      Aucun joueur inscrit dans ce tableau pour le moment.
                    </div>
                  )}
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          )
        })}
      </AccordionPrimitive.Root>
    </div>
  )
}
