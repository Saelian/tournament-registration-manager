import { useState, useMemo, useCallback } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../../../lib/api'
import { cn } from '../../../../lib/utils'
import { buttonVariants } from '@components/ui/button'
import { CsvExportModal, type ExportColumn, type CsvSeparator } from '@components/export'
import { TableAccordion as SharedTableAccordion, WaitlistDisplay, PlayerTable } from '../shared'
import { createByTableColumns } from './adminColumns'
import { AdminWaitlistActions, AdminWaitlistItem } from './AdminWaitlistActions'
import { PlayerDetailsModal } from './PlayerDetailsModal'
import { usePublicTournaments } from '@features/tournament'
import { usePublicTables } from '@features/tables'
import { aggregateByPlayer } from '../../hooks/adminHooks'
import type { RegistrationData, AggregatedPlayerRow } from '../../types'
import type { TableWithQuota, TableRegistrations } from '../shared/types'
import type { Table } from '@features/tables/types'

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

interface AdminTableAccordionProps {
  registrations: RegistrationData[]
}

/**
 * Groupe les inscriptions par tableau.
 */
function groupRegistrationsByTable(
  registrations: RegistrationData[],
  tables: TableWithQuota[]
): Record<number, TableRegistrations<RegistrationData>> {
  const acc: Record<number, TableRegistrations<RegistrationData>> = {}

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

export function AdminTableAccordion({ registrations }: AdminTableAccordionProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<AggregatedPlayerRow | null>(null)
  const [exportTableId, setExportTableId] = useState<number | null>(null)
  const [exportTableName, setExportTableName] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  const { data: tournaments } = usePublicTournaments()
  const activeTournament = tournaments?.[0]
  const { data: tables } = usePublicTables(activeTournament?.id?.toString())

  // Convertir les tables pour le composant TableAccordion partagé
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

  // Colonnes pour la vue par tableau
  const byTableColumns = useMemo(() => createByTableColumns(), [])

  const handleExportClick = (e: React.SyntheticEvent, tableId: number, tableName: string) => {
    e.stopPropagation()
    setExportTableId(tableId)
    setExportTableName(tableName)
  }

  const handleExport = async (config: { columns: ExportColumn[]; separator: CsvSeparator; presentOnly?: boolean }) => {
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

  // Render le tableau des joueurs pour un tableau donné
  const renderPlayerTable = useCallback(
    (tableRegistrations: RegistrationData[]) => {
      const aggregated = aggregateByPlayer(tableRegistrations)
      return (
        <PlayerTable
          data={aggregated}
          keyExtractor={(player) => player.playerId}
          columns={byTableColumns}
          pageSize={20}
          emptyMessage="Aucune inscription"
          onRowClick={setSelectedPlayer}
        />
      )
    },
    [byTableColumns]
  )

  // Render les actions du header (export CSV)
  const renderHeaderActions = useCallback(
    (tableId: number, tableName: string) => (
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => handleExportClick(e, tableId, tableName)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleExportClick(e, tableId, tableName)
          }
        }}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'hidden md:flex cursor-pointer')}
      >
        <Download className="w-4 h-4 mr-1" />
        CSV
      </span>
    ),
    []
  )

  // Render la liste d'attente avec actions admin
  const renderWaitlist = useCallback(
    (waitlist: RegistrationData[], tableName: string, quota: number, confirmedCount: number) => (
      <WaitlistDisplay
        waitlist={waitlist}
        tableName={tableName}
        showAdminActions={true}
        quota={quota}
        confirmedCount={confirmedCount}
        renderItem={(reg) => <AdminWaitlistItem registration={reg} />}
        renderAdminActions={(reg) => (
          <AdminWaitlistActions
            registration={reg}
            tableName={tableName}
            quota={quota}
            confirmedCount={confirmedCount}
          />
        )}
      />
    ),
    []
  )

  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground font-bold italic">
        Aucun tableau configuré pour ce tournoi.
      </div>
    )
  }

  return (
    <>
      <SharedTableAccordion
        registrations={registrations}
        tables={tablesWithQuota}
        groupByTable={groupRegistrationsByTable}
        renderPlayerTable={renderPlayerTable}
        renderWaitlist={renderWaitlist}
        renderHeaderActions={renderHeaderActions}
        showPresenceCount={true}
        isCheckedIn={(reg) => reg.checkedInAt !== null}
      />

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
