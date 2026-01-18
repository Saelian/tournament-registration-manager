import { useState } from 'react'
import { ArrowUp, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@components/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@components/ui/hover-card'
import { usePromoteRegistration } from '../../hooks'
import type { RegistrationData } from '../../types'

interface AdminWaitlistActionsProps {
    registration: RegistrationData
    tableName: string
    quota: number
    confirmedCount: number
}

/**
 * Composant pour les actions admin sur une entrée de liste d'attente.
 * Gère le bouton de promotion et la modale de confirmation.
 */
export function AdminWaitlistActions({ registration, tableName, quota, confirmedCount }: AdminWaitlistActionsProps) {
    const promoteMutation = usePromoteRegistration()
    const [promoteDialogOpen, setPromoteDialogOpen] = useState(false)

    const isFull = confirmedCount >= quota
    const playerName = `${registration.player.firstName} ${registration.player.lastName}`

    const handleConfirmPromote = () => {
        promoteMutation.mutate(registration.id, {
            onSuccess: () => {
                toast.success('Joueur promu avec succès. Un email de notification a été envoyé.')
                setPromoteDialogOpen(false)
            },
            onError: (error) => {
                toast.error(`Erreur lors de la promotion: ${error.message}`)
            },
        })
    }

    return (
        <>
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
                                <h4 className="text-sm font-semibold text-destructive">Impossible de promouvoir</h4>
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
                    onClick={() => setPromoteDialogOpen(true)}
                    disabled={promoteMutation.isPending}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Promouvoir
                </Button>
            )}

            <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Promouvoir depuis la liste d'attente</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir promouvoir <strong>{playerName}</strong> dans le tableau{' '}
                            <strong>{tableName}</strong> ?
                            <br />
                            <br />
                            Le joueur recevra un email l'invitant à régler son inscription dans les délais impartis.
                            S'il ne le fait pas, sa place sera remise en jeu.
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
        </>
    )
}

interface AdminWaitlistItemProps {
    registration: RegistrationData
}

/**
 * Rendu d'une ligne de liste d'attente pour le contexte admin.
 */
export function AdminWaitlistItem({ registration }: AdminWaitlistItemProps) {
    return (
        <>
            <span className="font-bold text-orange-600 w-8">#{registration.waitlistRank}</span>
            <div className="flex-1">
                <span className="font-semibold">{registration.player.lastName.toUpperCase()}</span>{' '}
                <span>{registration.player.firstName}</span>
                <span className="text-sm text-muted-foreground ml-2">({registration.player.points} pts)</span>
            </div>
            <span className="text-sm text-muted-foreground font-mono">{registration.player.licence}</span>
        </>
    )
}
