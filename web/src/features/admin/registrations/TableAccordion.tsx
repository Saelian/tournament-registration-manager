import { useState, useMemo } from 'react'
import { Users, Download } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { CsvExportModal, type ExportColumn, type CsvSeparator } from '../../../components/export'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../../components/ui/accordion'
import { Progress } from '../../../components/ui/progress'
import { PlayerRegistrationsTable } from './PlayerRegistrationsTable'
import { PlayerDetailsModal } from './PlayerDetailsModal'
import { usePublicTournaments, usePublicTables } from '../../public/hooks'
import type { RegistrationData, AggregatedPlayerRow } from './types'

// Colonnes disponibles pour l'export des inscriptions par tableau
const REGISTRATIONS_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'bibNumber', label: 'N° Dossard', included: true },
  { key: 'licence', label: 'Licence', included: true },
  { key: 'lastName', label: 'Nom', included: true },
  { key: 'firstName', label: 'Prénom', included: true },
  { key: 'points', label: 'Points', included: true },
  { key: 'category', label: 'Catégorie', included: true },
  { key: 'club', label: 'Club', included: true },
  { key: 'sex', label: 'Sexe', included: true },
  { key: 'status', label: 'Statut', included: true },
  { key: 'createdAt', label: "Date d'inscription", included: true },
  { key: 'email', label: 'Email', included: true },
  { key: 'phone', label: 'Téléphone', included: true },
]

interface TableAccordionProps {
  registrations: RegistrationData[]
}

export function TableAccordion({ registrations }: TableAccordionProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<AggregatedPlayerRow | null>(null)
  const [exportTableId, setExportTableId] = useState<number | null>(null)
  const [exportTableName, setExportTableName] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  const { data: tournaments } = usePublicTournaments()
  const activeTournament = tournaments?.[0]
  const { data: tables } = usePublicTables(activeTournament?.id?.toString())

  const registrationsByTable = useMemo(() => {
    if (!registrations || !tables) return {}

    const acc: Record<number, RegistrationData[]> = {}

    tables.forEach((table) => {
      acc[table.id] = registrations.filter((r) => r.table.id === table.id)
    })

    return acc
  }, [registrations, tables])

  const handleExportClick = (e: React.MouseEvent, tableId: number, tableName: string) => {
    e.stopPropagation()
    setExportTableId(tableId)
    setExportTableName(tableName)
  }

  const handleExport = async (config: { columns: ExportColumn[]; separator: CsvSeparator }) => {
    if (!exportTableId) return

    setIsExporting(true)
    try {
      const response = await api.post(
        '/admin/exports/registrations',
        {
          columns: config.columns,
          separator: config.separator,
          tableId: exportTableId,
        },
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const date = new Date().toISOString().split('T')[0]
      link.download = `inscriptions-${exportTableName.toLowerCase().replace(/\s+/g, '-')}-${date}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setExportTableId(null)
    } catch (err) {
      console.error('Export error:', err)
      toast.error("Erreur lors de l'export")
    } finally {
      setIsExporting(false)
    }
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground font-bold italic">
        Aucun tableau configuré pour ce tournoi.
      </div>
    )
  }

  const sortedTables = [...tables].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <Accordion type="single" collapsible className="space-y-4">
        {sortedTables.map((table) => {
          const tableRegistrations = registrationsByTable[table.id] || []
          const count = tableRegistrations.length
          const max = table.quota
          const percent = Math.min(100, (count / max) * 100)

          return (
            <AccordionItem key={table.id} value={`table-${table.id}`}>
              <AccordionTrigger className="flex-col md:flex-row md:items-center gap-4 p-4 md:p-6">
                <div className="flex items-center gap-4 flex-1">
                  <Users className="text-primary h-6 w-6" />
                  <div className="text-left">
                    <h3 className="text-xl font-black uppercase leading-none mb-1">{table.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {table.pointsMax > 0 ? `${table.pointsMax} pts max` : 'Ouvert à tous'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleExportClick(e, table.id, table.name)}
                    className="hidden md:flex"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <div className="flex-1 md:w-48 text-left">
                    <Progress
                      value={percent}
                      className="h-4 border-2 border-foreground/20 bg-secondary/30"
                      indicatorClassName={percent >= 100 ? 'bg-red-500' : 'bg-primary'}
                    />
                    <span className="text-sm">
                      {count}/{max} {count > 1 ? 'inscrits' : 'inscrit'}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-4 md:p-6 pt-0 bg-white">
                {tableRegistrations.length > 0 ? (
                  <PlayerRegistrationsTable
                    registrations={tableRegistrations}
                    showDayFilter={false}
                    showTableColumn={false}
                    onPlayerClick={setSelectedPlayer}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground font-bold italic">
                    Aucun joueur inscrit dans ce tableau pour le moment.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <PlayerDetailsModal
        player={selectedPlayer}
        allRegistrations={registrations}
        open={selectedPlayer !== null}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      />

      <CsvExportModal
        open={exportTableId !== null}
        onOpenChange={(open) => !open && setExportTableId(null)}
        title={`Exporter - ${exportTableName}`}
        columns={REGISTRATIONS_EXPORT_COLUMNS}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </>
  )
}
