import { useState, useMemo } from 'react'
import { SortableDataTable, type SortableColumn } from '../../components/ui/sortable-data-table'
import type { PublicRegistrationData, AggregatedPublicPlayer } from './types'

interface PublicPlayerTableProps {
    registrations: PublicRegistrationData[]
    tournamentDays?: string[]
    showDayFilter?: boolean
    showTableColumn?: boolean
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}

/**
 * Agrège les inscriptions par joueur (un joueur peut être inscrit à plusieurs tableaux).
 */
function aggregateByPlayer(
    registrations: PublicRegistrationData[],
    dayFilter?: string
): AggregatedPublicPlayer[] {
    const filtered = dayFilter
        ? registrations.filter((r) => r.table.date === dayFilter)
        : registrations

    const byPlayer = new Map<string, AggregatedPublicPlayer>()

    for (const reg of filtered) {
        const key = reg.player.licence
        const existing = byPlayer.get(key)
        if (existing) {
            // Éviter les doublons de tableaux
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

export function PublicPlayerTable({
    registrations,
    tournamentDays = [],
    showDayFilter = true,
    showTableColumn = true,
}: PublicPlayerTableProps) {
    const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)

    const aggregatedPlayers = useMemo(
        () => aggregateByPlayer(registrations, selectedDay),
        [registrations, selectedDay]
    )

    const columns: SortableColumn<AggregatedPublicPlayer>[] = useMemo(() => {
        const cols: SortableColumn<AggregatedPublicPlayer>[] = [
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

        if (showTableColumn) {
            cols.push({
                key: 'tables',
                header: 'Tableaux',
                sortable: false,
                render: (player) => (
                    <div className="flex flex-wrap gap-1">
                        {player.tables
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((table) => (
                                <span
                                    key={table.id}
                                    className="inline-flex items-center px-2 py-0.5 text-xs bg-secondary border border-foreground/20"
                                    title={`${formatDate(table.date)} ${table.startTime}`}
                                >
                                    {table.name}
                                </span>
                            ))}
                    </div>
                ),
            })
        }

        return cols
    }, [showTableColumn])

    const handleDayFilterChange = (value: string) => {
        setSelectedDay(value || undefined)
    }

    return (
        <div className="space-y-4">
            {showDayFilter && tournamentDays.length > 0 && (
                <div className="flex items-center gap-4">
                    <label htmlFor="day-filter" className="font-semibold">
                        Jour :
                    </label>
                    <select
                        id="day-filter"
                        value={selectedDay || ''}
                        onChange={(e) => handleDayFilterChange(e.target.value)}
                        className="px-3 py-2 border-2 border-foreground bg-card font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Tous les jours</option>
                        {tournamentDays.map((day) => (
                            <option key={day} value={day}>
                                {formatDate(day)}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-muted-foreground">
                        {aggregatedPlayers.length} joueur{aggregatedPlayers.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}

            <SortableDataTable
                data={aggregatedPlayers}
                columns={columns}
                keyExtractor={(player) => player.licence}
                sortable
                initialSort={{ column: 'lastName', direction: 'asc' }}
                searchable
                searchPlaceholder="Rechercher un joueur..."
                searchKeys={['lastName', 'firstName', 'licence', 'club']}
                pagination={{ pageSize: 20, showFirstLast: true, showPageNumbers: true }}
                emptyMessage="Aucun joueur inscrit"
            />
        </div>
    )
}
