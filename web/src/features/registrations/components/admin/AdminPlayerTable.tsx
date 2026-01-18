import { useState, useMemo } from 'react'
import { ShieldCheck } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { toast } from 'sonner'
import { PlayerTable } from '../shared'
import { createAllPlayersColumns } from './adminColumns'
import { useAggregatedPlayers, usePromoteRegistration } from '../../hooks'
import type { RegistrationData, AggregatedPlayerRow } from '../../types'

interface AdminPlayerTableProps {
    registrations: RegistrationData[]
    tournamentDays?: string[]
    showDayFilter?: boolean
    showAdminFilter?: boolean
    onPlayerClick?: (player: AggregatedPlayerRow) => void
}

export function AdminPlayerTable({
    registrations,
    tournamentDays = [],
    showDayFilter = true,
    showAdminFilter = false,
    onPlayerClick,
}: AdminPlayerTableProps) {
    const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)
    const [adminOnlyFilter, setAdminOnlyFilter] = useState(false)
    const [promoteDialogOpen, setPromoteDialogOpen] = useState(false)
    const [registrationToPromote, setRegistrationToPromote] = useState<{
        id: number
        playerName: string
        tableName: string
    } | null>(null)

    // Filter registrations by admin-created if filter is active
    const filteredRegistrations = useMemo(() => {
        if (!adminOnlyFilter) return registrations
        return registrations.filter((r) => r.isAdminCreated)
    }, [registrations, adminOnlyFilter])

    const aggregatedPlayers = useAggregatedPlayers(filteredRegistrations, selectedDay)
    const promoteMutation = usePromoteRegistration()

    const handleConfirmPromote = () => {
        if (!registrationToPromote) return

        promoteMutation.mutate(registrationToPromote.id, {
            onSuccess: () => {
                toast.success(`${registrationToPromote.playerName} a été promu(e). Un email lui a été envoyé.`)
                setPromoteDialogOpen(false)
                setRegistrationToPromote(null)
            },
            onError: (error) => {
                toast.error(`Erreur: ${error.message}`)
            },
        })
    }

    // Colonnes admin avec tableaux
    const columns = useMemo(() => createAllPlayersColumns(), [])

    // Filtre additionnel pour admin
    const additionalFilters = showAdminFilter ? (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={adminOnlyFilter}
                onChange={(e) => setAdminOnlyFilter(e.target.checked)}
                className="w-4 h-4 border-2 border-foreground"
            />
            <span className="flex items-center gap-1 text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Inscriptions admin uniquement
            </span>
        </label>
    ) : undefined

    return (
        <>
            <PlayerTable
                data={aggregatedPlayers}
                keyExtractor={(player) => player.playerId}
                columns={columns}
                showDayFilter={showDayFilter}
                tournamentDays={tournamentDays}
                selectedDay={selectedDay}
                onDayChange={setSelectedDay}
                pageSize={20}
                emptyMessage="Aucune inscription"
                onRowClick={onPlayerClick}
                additionalFilters={additionalFilters}
                searchKeys={['lastName', 'firstName', 'licence']}
            />

            <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Promouvoir depuis la liste d'attente</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir promouvoir <strong>{registrationToPromote?.playerName}</strong>{' '}
                            pour le tableau <strong>{registrationToPromote?.tableName}</strong> ?
                            <br />
                            <br />
                            Un email sera envoyé au joueur pour l'informer qu'une place s'est libérée et qu'il doit
                            procéder au paiement dans les délais impartis.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="secondary" onClick={() => setPromoteDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleConfirmPromote} disabled={promoteMutation.isPending}>
                            {promoteMutation.isPending ? 'Promotion...' : "Confirmer et envoyer l'email"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
