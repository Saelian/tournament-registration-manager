import { Users } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../../components/ui/dialog'
import { usePublicRegistrations } from './hooks'
import { SortableDataTable, type SortableColumn } from '../../components/ui/sortable-data-table'
import type { PublicRegistrationData } from './types'

interface TablePlayersModalProps {
    isOpen: boolean
    onClose: () => void
    tableId: number
    tableName: string
}

interface TablePlayer {
    licence: string
    firstName: string
    lastName: string
    points: number
    category: string | null
    club: string
}

function extractPlayers(registrations: PublicRegistrationData[]): TablePlayer[] {
    return registrations.map((reg) => ({
        licence: reg.player.licence,
        firstName: reg.player.firstName,
        lastName: reg.player.lastName,
        points: reg.player.points,
        category: reg.player.category,
        club: reg.player.club,
    }))
}

const columns: SortableColumn<TablePlayer>[] = [
    {
        key: 'licence',
        header: 'Licence',
        sortable: true,
        render: (player) => <span className="font-mono text-sm">{player.licence}</span>,
    },
    {
        key: 'lastName',
        header: 'Nom',
        sortable: true,
        render: (player) => <span className="font-semibold">{player.lastName.toUpperCase()}</span>,
    },
    {
        key: 'firstName',
        header: 'Prénom',
        sortable: true,
    },
    {
        key: 'points',
        header: 'Pts',
        sortable: true,
        className: 'text-right',
        headerClassName: 'text-right',
    },
    {
        key: 'category',
        header: 'Cat.',
        sortable: true,
        render: (player) => <span>{player.category || '-'}</span>,
    },
    {
        key: 'club',
        header: 'Club',
        sortable: true,
        render: (player) => (
            <span className="text-sm text-muted-foreground truncate max-w-[200px] block" title={player.club}>
                {player.club}
            </span>
        ),
    },
]

export function TablePlayersModal({ isOpen, onClose, tableId, tableName }: TablePlayersModalProps) {
    const { data, isLoading } = usePublicRegistrations(tableId)

    const players = data?.registrations ? extractPlayers(data.registrations) : []

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Joueurs inscrits - {tableName}
                    </DialogTitle>
                    <DialogDescription>
                        {players.length} joueur{players.length !== 1 ? 's' : ''} inscrit{players.length !== 1 ? 's' : ''}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-muted rounded" />
                        ))}
                    </div>
                ) : (
                    <SortableDataTable
                        data={players}
                        columns={columns}
                        keyExtractor={(player) => player.licence}
                        sortable
                        initialSort={{ column: 'lastName', direction: 'asc' }}
                        searchable
                        searchPlaceholder="Rechercher..."
                        searchKeys={['lastName', 'firstName', 'licence', 'club']}
                        pagination={{ pageSize: 10, showFirstLast: false, showPageNumbers: true }}
                        emptyMessage="Aucun joueur inscrit"
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
