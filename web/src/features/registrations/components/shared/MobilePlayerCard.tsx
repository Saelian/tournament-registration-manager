import type { BaseAggregatedPlayer, BaseTableInfo, MobilePlayerCardProps } from './types'
import { formatDateShort } from '@lib/formatting-helpers'

/**
 * Composant carte pour l'affichage mobile d'un joueur.
 * Utilisé dans PlayerTable pour la vue responsive.
 */
export function MobilePlayerCard<T extends BaseAggregatedPlayer>({
    player,
    showTableColumn = true,
    renderAdditionalContent,
    renderTableBadge,
}: MobilePlayerCardProps<T>) {
    const defaultTableBadge = (table: BaseTableInfo) => (
        <span
            key={table.id}
            className="inline-flex items-center px-2 py-0.5 text-xs bg-secondary border border-foreground/20"
            title={`${formatDateShort(table.date)} ${table.startTime}`}
        >
            {table.name}
        </span>
    )

    return (
        <div className="bg-card border-2 border-foreground p-4 shadow-[2px_2px_0px_0px] shadow-foreground">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                    <span className="font-black text-lg uppercase">{player.lastName}</span>{' '}
                    <span className="font-semibold">{player.firstName}</span>
                </div>
                <span className="bg-primary text-primary-foreground font-bold text-sm px-2 py-1">
                    {player.points} pts
                </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
                <div>
                    <span className="font-medium">Licence:</span> <span className="font-mono">{player.licence}</span>
                </div>
                <div>
                    <span className="font-medium">Cat.:</span>{' '}
                    {'category' in player ? (player.category as string | null) || '-' : '-'}
                </div>
                <div className="col-span-2 truncate" title={player.club}>
                    <span className="font-medium">Club:</span> {player.club}
                </div>
            </div>

            {renderAdditionalContent?.(player)}

            {showTableColumn && player.tables.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-foreground/10">
                    {player.tables
                        .slice()
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((table) => (renderTableBadge ? renderTableBadge(table) : defaultTableBadge(table)))}
                </div>
            )}
        </div>
    )
}
