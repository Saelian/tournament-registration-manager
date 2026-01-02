import { useState } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { useTableRegistrations } from './hooks'
import { PlayerRegistrationsTable } from './PlayerRegistrationsTable'
import { PlayerDetailsModal } from './PlayerDetailsModal'
import type { AggregatedPlayerRow } from './types'

interface TableRegistrationsModalProps {
  tableId: number | null
  tableName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TableRegistrationsModal({
  tableId,
  tableName,
  open,
  onOpenChange,
}: TableRegistrationsModalProps) {
  const { data, isLoading, error } = useTableRegistrations(tableId ?? 0)
  const [selectedPlayer, setSelectedPlayer] = useState<AggregatedPlayerRow | null>(null)

  if (!tableId) return null

  const registrations = data?.registrations ?? []

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Inscriptions - {tableName}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border-2 border-destructive p-4">
                <p className="font-bold text-destructive">Erreur lors du chargement</p>
                <p className="text-sm text-destructive/80">{error.message}</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {registrations.length} inscription{registrations.length !== 1 ? 's' : ''}
                </div>
                <PlayerRegistrationsTable
                  registrations={registrations}
                  showDayFilter={false}
                  showTableColumn={false}
                  onPlayerClick={setSelectedPlayer}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PlayerDetailsModal
        player={selectedPlayer}
        allRegistrations={registrations}
        open={selectedPlayer !== null}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      />
    </>
  )
}
