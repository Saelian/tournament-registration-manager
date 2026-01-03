import { useState } from 'react'
import { Users, Loader2, LayoutList, Layers, Download } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useAdminRegistrations } from './hooks'
import { PlayerRegistrationsTable } from './PlayerRegistrationsTable'
import { PlayerDetailsModal } from './PlayerDetailsModal'
import { TableAccordion } from './TableAccordion'
import { CsvExportModal, useExportCsv, type ExportColumn } from '../../../components/export'
import type { AggregatedPlayerRow } from './types'

// Colonnes disponibles pour l'export des inscriptions
const REGISTRATIONS_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'bibNumber', label: 'N° Dossard', included: true },
  { key: 'licence', label: 'Licence', included: true },
  { key: 'lastName', label: 'Nom', included: true },
  { key: 'firstName', label: 'Prénom', included: true },
  { key: 'points', label: 'Points', included: true },
  { key: 'category', label: 'Catégorie', included: true },
  { key: 'club', label: 'Club', included: true },
  { key: 'sex', label: 'Sexe', included: true },
  { key: 'tables', label: 'Tableaux', included: true },
  { key: 'status', label: 'Statut', included: true },
  { key: 'createdAt', label: "Date d'inscription", included: true },
  { key: 'email', label: 'Email', included: true },
  { key: 'phone', label: 'Téléphone', included: true },
]

export function RegistrationsPage() {
  const { data, isLoading, error } = useAdminRegistrations()
  const [selectedPlayer, setSelectedPlayer] = useState<AggregatedPlayerRow | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Export CSV
  const { exportCsv, isExporting } = useExportCsv({
    endpoint: '/admin/exports/registrations',
    filenamePrefix: 'inscriptions',
  })

  const handleExport = async (config: { columns: ExportColumn[]; separator: ';' | ',' | '\t' }) => {
    await exportCsv(config)
    setIsExportModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 border-2 border-destructive p-4">
          <p className="font-bold text-destructive">Erreur lors du chargement des inscriptions</p>
          <p className="text-sm text-destructive/80">{error.message}</p>
        </div>
      </div>
    )
  }

  const registrations = data?.registrations ?? []
  const tournamentDays = data?.tournamentDays ?? []

  // Count unique players
  const uniquePlayers = new Set(registrations.map((r) => r.player.id)).size

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Inscriptions
          </h1>
          <p className="text-muted-foreground mt-2">Gestion des joueurs inscrits au tournoi</p>
        </div>
        <Button variant="secondary" onClick={() => setIsExportModalOpen(true)}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-medium text-muted-foreground">Joueurs uniques</p>
          <p className="text-3xl font-bold">{uniquePlayers}</p>
        </div>
        <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-medium text-muted-foreground">Inscriptions totales</p>
          <p className="text-3xl font-bold">{registrations.length}</p>
        </div>
        <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-medium text-muted-foreground">Jours du tournoi</p>
          <p className="text-3xl font-bold">{tournamentDays.length}</p>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="all-players" className="w-full ">
        <TabsList className="mb-6 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <TabsTrigger value="all-players" className="gap-2 w-full">
            <LayoutList className="h-4 w-4" />
            Tous les joueurs
          </TabsTrigger>
          <TabsTrigger value="by-table" className="gap-2 w-full">
            <Layers className="h-4 w-4" />
            Par tableau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-players">
          <div className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <PlayerRegistrationsTable
              registrations={registrations}
              tournamentDays={tournamentDays}
              showDayFilter={true}
              showTableColumn={true}
              onPlayerClick={setSelectedPlayer}
            />
          </div>

          <PlayerDetailsModal
            player={selectedPlayer}
            allRegistrations={registrations}
            open={selectedPlayer !== null}
            onOpenChange={(open) => !open && setSelectedPlayer(null)}
          />
        </TabsContent>

        <TabsContent value="by-table">
          <TableAccordion registrations={registrations} />
        </TabsContent>
      </Tabs>

      <CsvExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Exporter les inscriptions"
        columns={REGISTRATIONS_EXPORT_COLUMNS}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  )
}
