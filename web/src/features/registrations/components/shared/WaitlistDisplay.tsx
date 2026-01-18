import { Clock } from 'lucide-react'
import type { WaitlistDisplayProps } from './types'

/**
 * Composant d'affichage de la liste d'attente.
 * Utilisé dans TableAccordion pour afficher les joueurs en attente.
 * Configurable pour les contextes admin (avec actions) et public (lecture seule).
 */
export function WaitlistDisplay<TReg>({
    waitlist,
    showAdminActions = false,
    renderItem,
    renderAdminActions,
}: WaitlistDisplayProps<TReg>) {
    if (waitlist.length === 0) {
        return null
    }

    return (
        <div className="mt-6 pt-4 border-t-2 border-foreground/10">
            <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-orange-500" />
                Liste d'attente ({waitlist.length})
            </h4>
            <div className="space-y-2">
                {waitlist.map((registration, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-orange-50 border border-orange-200">
                        {renderItem(registration, index)}
                        {showAdminActions && renderAdminActions?.(registration)}
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Composant de rendu par défaut pour une ligne de liste d'attente publique.
 */
export interface PublicWaitlistItemProps {
    rank: number | null
    lastName: string
    firstName: string
    points: number
    licence: string
}

export function PublicWaitlistItem({ rank, lastName, firstName, points, licence }: PublicWaitlistItemProps) {
    return (
        <>
            <span className="font-bold text-orange-600 w-8">#{rank}</span>
            <div className="flex-1">
                <span className="font-semibold">{lastName.toUpperCase()}</span> <span>{firstName}</span>
                <span className="text-sm text-muted-foreground ml-2">({points} pts)</span>
            </div>
            <span className="text-sm text-muted-foreground font-mono">{licence}</span>
        </>
    )
}
