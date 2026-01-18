import { useState, useMemo, useCallback } from 'react'
import { Users, LayoutList, Layers } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { PageHeader } from '@components/ui/page-header'
import { usePublicTournaments } from '../../tournament/hooks'
import { usePublicTables } from '../../tables/hooks'
import { usePublicRegistrations } from '../hooks'
import { PlayerTable, TableAccordion, WaitlistDisplay, PublicWaitlistItem } from '../components/shared'
import { createPublicColumnsWithTables, createPublicColumnsWithoutTables } from '../components/public/publicColumns'
import type { PublicRegistrationData, AggregatedPublicPlayer } from '../types'
import type { TableWithQuota, TableRegistrations } from '../components/shared/types'
import type { Table } from '../../tables/types'

/**
 * Agrège les inscriptions par joueur (un joueur peut être inscrit à plusieurs tableaux).
 */
function aggregateByPlayer(registrations: PublicRegistrationData[]): AggregatedPublicPlayer[] {
  const byPlayer = new Map<string, AggregatedPublicPlayer>()

  for (const reg of registrations) {
    const key = reg.player.licence
    const existing = byPlayer.get(key)
    if (existing) {
      if (!existing.tables.find((t) => t.id === reg.table.id)) {
        existing.tables.push(reg.table)
      }
    } else {
      byPlayer.set(key, {
        licence: reg.player.licence,
        firstName: reg.player.firstName,
        lastName: reg.player.lastName,
        points: reg.player.points,
        category: reg.player.category,
        club: reg.player.club,
        tables: [reg.table],
      })
    }
  }

  return Array.from(byPlayer.values()).sort((a, b) => a.lastName.localeCompare(b.lastName))
}

/**
 * Groupe les inscriptions par tableau.
 */
function groupRegistrationsByTable(
  registrations: PublicRegistrationData[],
  tables: TableWithQuota[]
): Record<number, TableRegistrations<PublicRegistrationData>> {
  const acc: Record<number, TableRegistrations<PublicRegistrationData>> = {}

  tables.forEach((table) => {
    const tableRegs = registrations.filter((r) => r.table.id === table.id)
    acc[table.id] = {
      confirmed: tableRegs.filter((r) => r.status === 'paid' || r.status === 'pending_payment'),
      waitlist: tableRegs
        .filter((r) => r.status === 'waitlist')
        .sort((a, b) => (a.waitlistRank ?? 0) - (b.waitlistRank ?? 0)),
    }
  })

  return acc
}

export function PublicPlayersPage() {
  const { data: tournaments, isLoading: isLoadingTournaments } = usePublicTournaments()
  const activeTournament = tournaments?.[0]

  const { data: tables, isLoading: isLoadingTables } = usePublicTables(activeTournament?.id?.toString())
  const { data: registrationData, isLoading: isLoadingRegistrations } = usePublicRegistrations()
  const allRegistrations = registrationData?.registrations
  const tournamentDays = registrationData?.tournamentDays ?? []

  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)

  // Filter only confirmed registrations (paid + pending_payment) for main table
  const confirmedRegistrations = useMemo(() => {
    if (!allRegistrations) return []
    return allRegistrations.filter((r: PublicRegistrationData) => r.status === 'paid' || r.status === 'pending_payment')
  }, [allRegistrations])

  // Filter by day and aggregate
  const filteredRegistrations = useMemo(() => {
    if (!selectedDay) return confirmedRegistrations
    return confirmedRegistrations.filter((r) => r.table.date === selectedDay)
  }, [confirmedRegistrations, selectedDay])

  const aggregatedPlayers = useMemo(() => aggregateByPlayer(filteredRegistrations), [filteredRegistrations])

  // Colonnes pour la vue "Tous les joueurs"
  const allPlayersColumns = useMemo(() => createPublicColumnsWithTables(), [])

  // Colonnes pour la vue par tableau (sans colonne tableaux)
  const byTableColumns = useMemo(() => createPublicColumnsWithoutTables(), [])

  // Convertir les tables pour le composant TableAccordion
  const tablesWithQuota: TableWithQuota[] = useMemo(() => {
    if (!tables) return []
    return tables.map((t: Table) => ({
      id: t.id,
      name: t.name,
      date: t.date,
      startTime: t.startTime,
      quota: t.quota,
      pointsMax: t.pointsMax,
    }))
  }, [tables])

  // Render le tableau des joueurs pour un tableau donné
  const renderPlayerTable = useCallback(
    (tableRegistrations: PublicRegistrationData[]) => {
      const aggregated = aggregateByPlayer(tableRegistrations)
      return (
        <PlayerTable
          data={aggregated}
          keyExtractor={(player) => player.licence}
          columns={byTableColumns}
          pageSize={20}
          emptyMessage="Aucun joueur inscrit"
        />
      )
    },
    [byTableColumns]
  )

  // Render la liste d'attente
  const renderWaitlist = useCallback(
    (waitlist: PublicRegistrationData[], tableName: string) => (
      <WaitlistDisplay
        waitlist={waitlist}
        tableName={tableName}
        renderItem={(reg) => (
          <PublicWaitlistItem
            rank={reg.waitlistRank}
            lastName={reg.player.lastName}
            firstName={reg.player.firstName}
            points={reg.player.points}
            licence={reg.player.licence}
          />
        )}
      />
    ),
    []
  )

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
          <h2 className="text-2xl font-black uppercase text-destructive mb-2">Aucun tournoi actif</h2>
          <p className="font-bold">Revenez plus tard !</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title="Joueurs inscrits"
          description="Consultez la liste des joueurs inscrits au tournoi"
          icon={Users}
          backLink="/"
        />

        <Tabs defaultValue="all-players" className="w-full animate-on-load animate-slide-up animation-delay-300">
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
            <PlayerTable
              data={aggregatedPlayers}
              keyExtractor={(player) => player.licence}
              columns={allPlayersColumns}
              showDayFilter={true}
              tournamentDays={tournamentDays}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
              pageSize={20}
              emptyMessage="Aucun joueur inscrit"
            />
          </TabsContent>

          <TabsContent value="by-table">
            {tablesWithQuota.length > 0 ? (
              <TableAccordion
                registrations={allRegistrations ?? []}
                tables={tablesWithQuota}
                groupByTable={groupRegistrationsByTable}
                renderPlayerTable={renderPlayerTable}
                renderWaitlist={renderWaitlist}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground font-bold italic">Aucun tableau disponible.</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
