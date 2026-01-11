import { useState, useMemo } from 'react'
import { Users, Download, Clock, ArrowUp, AlertCircle, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../../lib/api'
import { cn } from '../../../lib/utils'
import { Button, buttonVariants } from '@components/ui/button'
import { CsvExportModal, type ExportColumn, type CsvSeparator } from '@components/export'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@components/ui/hover-card'
import { Progress } from '@components/ui/progress'
import { PlayerRegistrationsTable } from './PlayerRegistrationsTable'
import { PlayerDetailsModal } from './PlayerDetailsModal'
import { usePublicTournaments, usePublicTables } from '../../public/hooks'
import { usePromoteRegistration } from './hooks'
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
  { key: 'presence', label: 'Présence', included: true },
  { key: 'checkedInAt', label: 'Heure de pointage', included: true },
  { key: 'createdAt', label: "Date d'inscription", included: true },
  { key: 'email', label: 'Email', included: true },
  { key: 'phone', label: 'Téléphone', included: true },
]

interface TableAccordionProps {
  registrations: RegistrationData[]
}

interface WaitlistSectionProps {
  waitlist: RegistrationData[]
  tableName: string
  quota: number
  confirmedCount: number
}

function WaitlistSection({ waitlist, tableName, quota, confirmedCount }: WaitlistSectionProps) {
  const promoteMutation = usePromoteRegistration()
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<{
    id: number
    name: string
  } | null>(null)

  const isFull = confirmedCount >= quota

  const handlePromoteClick = (registration: RegistrationData) => {
    setSelectedRegistration({
      id: registration.id,
      name: `${registration.player.firstName} ${registration.player.lastName}`,
    })
    setPromoteDialogOpen(true)
  }

  const handleConfirmPromote = () => {
    if (!selectedRegistration) return

    promoteMutation.mutate(selectedRegistration.id, {
      onSuccess: () => {
        toast.success('Joueur promu avec succès. Un email de notification a été envoyé.')
        setPromoteDialogOpen(false)
        setSelectedRegistration(null)
      },
      onError: (error) => {
        toast.error(`Erreur lors de la promotion: ${error.message}`)
      },
    })
  }

  return (
    <div className="mt-6 pt-4 border-t-2 border-foreground/10">
      <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-orange-500" />
        Liste d'attente ({waitlist.length})
      </h4>
      <div className="space-y-2">
        {waitlist.map((reg) => (
          <div
            key={reg.id}
            className="flex items-center gap-4 p-3 bg-orange-50 border border-orange-200"
          >
            <span className="font-bold text-orange-600 w-8">#{reg.waitlistRank}</span>
            <div className="flex-1">
              <span className="font-semibold">{reg.player.lastName.toUpperCase()}</span>{' '}
              <span>{reg.player.firstName}</span>
              <span className="text-sm text-muted-foreground ml-2">({reg.player.points} pts)</span>
            </div>
            <span className="text-sm text-muted-foreground font-mono">{reg.player.licence}</span>

            {isFull ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="opacity-50 cursor-not-allowed border-primary text-primary"
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      Promouvoir
                    </Button>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-destructive">
                        Impossible de promouvoir
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Le tableau est complet ({confirmedCount}/{quota}). Une place doit se libérer
                        (désistement ou annulation) pour pouvoir promouvoir un joueur.
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePromoteClick(reg)}
                disabled={promoteMutation.isPending}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Promouvoir
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promouvoir depuis la liste d'attente</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir promouvoir <strong>{selectedRegistration?.name}</strong> dans
              le tableau <strong>{tableName}</strong> ?
              <br />
              <br />
              Le joueur recevra un email l'invitant à régler son inscription dans les délais
              impartis. S'il ne le fait pas, sa place sera remise en jeu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmPromote} disabled={promoteMutation.isPending}>
              {promoteMutation.isPending ? 'Promotion...' : 'Confirmer la promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
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

    const acc: Record<number, { confirmed: RegistrationData[]; waitlist: RegistrationData[] }> = {}

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
  }, [registrations, tables])

  const handleExportClick = (e: React.SyntheticEvent, tableId: number, tableName: string) => {
    e.stopPropagation()
    setExportTableId(tableId)
    setExportTableName(tableName)
  }

  const handleExport = async (config: {
    columns: ExportColumn[]
    separator: CsvSeparator
    presentOnly?: boolean
  }) => {
    if (!exportTableId) return

    setIsExporting(true)
    try {
      const response = await api.post(
        '/admin/exports/registrations',
        {
          columns: config.columns,
          separator: config.separator,
          tableId: exportTableId,
          presentOnly: config.presentOnly,
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
          const tableData = registrationsByTable[table.id] || { confirmed: [], waitlist: [] }
          const confirmedCount = tableData.confirmed.length
          const waitlistCount = tableData.waitlist.length
          const presentCount = tableData.confirmed.filter((r) => r.checkedInAt !== null).length
          const max = table.quota
          const percent = Math.min(100, (confirmedCount / max) * 100)

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
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleExportClick(e, table.id, table.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleExportClick(e, table.id, table.name)
                      }
                    }}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'hidden md:flex cursor-pointer'
                    )}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </span>
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
                      {presentCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 border border-green-300">
                          <UserCheck className="w-3 h-3" />
                          {presentCount}/{confirmedCount}
                        </span>
                      )}
                      {waitlistCount > 0 && (
                        <span className="text-orange-600">(+{waitlistCount} attente)</span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-4 md:p-6 pt-0 bg-white space-y-6">
                {/* Inscriptions confirmées */}
                {tableData.confirmed.length > 0 ? (
                  <PlayerRegistrationsTable
                    registrations={tableData.confirmed}
                    showDayFilter={false}
                    showTableColumn={false}
                    showStatusColumn={true}
                    showPresenceColumn={true}
                    onPlayerClick={setSelectedPlayer}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground font-bold italic">
                    Aucun joueur inscrit dans ce tableau pour le moment.
                  </div>
                )}

                {/* Liste d'attente */}
                {tableData.waitlist.length > 0 && (
                  <WaitlistSection
                    waitlist={tableData.waitlist}
                    tableName={table.name}
                    quota={table.quota}
                    confirmedCount={confirmedCount}
                  />
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
        showPresentOnlyOption={true}
      />
    </>
  )
}
