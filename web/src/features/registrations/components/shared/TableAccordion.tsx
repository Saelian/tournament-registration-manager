import { useMemo } from 'react'
import { Users, UserCheck } from 'lucide-react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@components/ui/accordion'
import { Progress } from '@components/ui/progress'
import type { TableAccordionProps } from './types'

/**
 * Composant accordion pour afficher les inscriptions par tableau.
 * Utilisable pour les contextes admin et public avec configuration via render props.
 */
export function TableAccordion<TReg>({
  registrations,
  tables,
  groupByTable,
  renderPlayerTable,
  renderWaitlist,
  renderHeaderActions,
  showPresenceCount = false,
  isCheckedIn,
}: TableAccordionProps<TReg>) {
  const registrationsByTable = useMemo(() => {
    return groupByTable(registrations, tables)
  }, [registrations, tables, groupByTable])

  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground font-bold italic">
        Aucun tableau configuré pour ce tournoi.
      </div>
    )
  }

  const sortedTables = [...tables].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Accordion type="single" collapsible className="space-y-4">
      {sortedTables.map((table, index) => {
        const tableData = registrationsByTable[table.id] || { confirmed: [], waitlist: [] }
        const confirmedCount = tableData.confirmed.length
        const waitlistCount = tableData.waitlist.length
        const presentCount =
          showPresenceCount && isCheckedIn ? tableData.confirmed.filter((r) => isCheckedIn(r)).length : 0
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
                  <h3 className="text-xl font-black uppercase leading-none mb-1">{table.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {table.pointsMax > 0 ? `${table.pointsMax} pts max` : 'Ouvert à tous'}
                    <span className="mx-2">•</span>
                    <span className="capitalize">
                      {new Date(table.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                    <span> {table.startTime.slice(0, 5)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto">
                {renderHeaderActions?.(table.id, table.name)}
                <div className="flex-1 md:w-48 text-left">
                  <Progress
                    value={percent}
                    className="h-4 border-2 border-foreground/20 bg-secondary/30"
                    indicatorClassName={percent >= 100 ? 'bg-red-500' : 'bg-primary'}
                  />
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span>
                      {confirmedCount}/{max} inscrit{confirmedCount > 1 ? 's' : ''}
                    </span>
                    {showPresenceCount && presentCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 border border-green-300">
                        <UserCheck className="w-3 h-3" />
                        {presentCount}/{confirmedCount}
                      </span>
                    )}
                    {waitlistCount > 0 && (
                      <span className="text-orange-600">
                        (+{waitlistCount} {showPresenceCount ? 'attente' : 'en attente'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="p-4 md:p-6 pt-0 space-y-6">
              {/* Inscriptions confirmées */}
              {tableData.confirmed.length > 0 ? (
                renderPlayerTable(tableData.confirmed)
              ) : (
                <div className="text-center py-8 text-muted-foreground font-bold italic">
                  Aucun joueur inscrit dans ce tableau pour le moment.
                </div>
              )}

              {/* Liste d'attente */}
              {tableData.waitlist.length > 0 &&
                renderWaitlist?.(tableData.waitlist, table.name, table.quota, confirmedCount)}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
