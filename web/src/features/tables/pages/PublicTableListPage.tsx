import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@components/ui/page-header'
import { LayoutGridIcon, AlertCircle, Mail, UsersIcon, CreditCard } from 'lucide-react'
import { RegistrationPanel } from '../../registrations/components/public/RegistrationPanel'
import { CartSummary } from '../../registrations/components/public/CartSummary'
import { TableFilters } from '../../registrations/components/public/TableFilters'
import { useCreateRegistrations } from '../../registrations/hooks'
import { TableCard } from '../components/TableCard'
import { RegistrationHelp, type HelpStep, RegistrationStatusAlert } from '@features/tournament'
import { useTableListLogic } from '../hooks/publicHooks'
import { cn } from '@lib/utils'
import type { EligibleTable } from '../types'

const REGISTRATION_STEPS: HelpStep[] = [
    {
        icon: Mail,
        title: 'Connexion',
        description: 'Je me connecte avec mon adresse email.',
        variant: 'pink',
    },
    {
        icon: UsersIcon,
        title: 'Joueur',
        description: 'Je retrouve mon profil via mon n° de licence.',
        variant: 'yellow',
    },
    {
        icon: LayoutGridIcon,
        title: 'Tableaux',
        description: 'Je sélectionne les tableaux souhaités.',
        variant: 'green',
    },
    {
        icon: CreditCard,
        title: 'Paiement',
        description: 'Je confirme et paie via HelloAsso.',
        variant: 'blue',
    },
    {
        icon: UsersIcon,
        title: 'Confirmation',
        description: 'Je retrouve mes inscriptions dans mon espace.',
        variant: 'purple',
    },
]

export function PublicTableListPage() {
    const { tournamentId } = useParams()
    const navigate = useNavigate()
    const createRegistrations = useCreateRegistrations()

    const {
        player,
        selectedTableIds,
        error,
        setError,
        showEligibleOnly,
        setShowEligibleOnly,
        isLoading,
        registrationStatus,
        isRegistrationOpen,
        tables,
        filteredTables,
        selectedTables,
        cartPaddingBottom,
        isBlockedByTimeConflict,
        isBlockedByDailyLimit,
        handlePlayerSelect,
        handlePlayerClear,
        handleToggle,
        handleRemove,
    } = useTableListLogic(tournamentId)

    const handleSubmit = async () => {
        if (!player?.id) return
        setError(null)

        try {
            const result = await createRegistrations.mutateAsync({
                playerId: player.id,
                tableIds: selectedTableIds,
                initiatePayment: true,
            })

            const waitlistCount = result.registrations.filter((r) => r.status === 'waitlist').length
            const directCount = result.registrations.filter((r) => r.status === 'pending_payment').length

            // Reset local state
            handlePlayerClear()

            // If we have a redirect URL, redirect directly to HelloAsso for payment
            if (result.redirectUrl) {
                window.location.href = result.redirectUrl
                return
            }

            // If payment initiation failed but registrations were created
            if (result.paymentError) {
                navigate('/dashboard', {
                    state: {
                        message:
                            "Inscriptions créées mais le paiement n'a pas pu être initié. Veuillez procéder au paiement depuis le tableau de bord.",
                        variant: 'warning',
                    },
                })
                return
            }

            // All waitlist case (no payment needed)
            if (waitlistCount > 0 && directCount === 0) {
                navigate('/dashboard', {
                    state: {
                        message: `${waitlistCount} inscription(s) ajoutée(s) en liste d'attente.`,
                    },
                })
                return
            }

            // Mixed case: some waitlist, some pending payment but no redirectUrl
            // This shouldn't happen normally, but handle it gracefully
            if (waitlistCount > 0 && directCount > 0) {
                navigate('/dashboard', {
                    state: {
                        message: `${directCount} inscription(s) confirmée(s) et ${waitlistCount} ajoutée(s) en liste d'attente.`,
                    },
                })
            } else {
                // Fallback: redirect to dashboard
                navigate('/dashboard', {
                    state: {
                        message: `${directCount} inscription(s) confirmée(s) ! Procédez au paiement.`,
                    },
                })
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: string[] } } }
            const msg = error.response?.data?.message || "Erreur lors de l'inscription"
            const details = error.response?.data?.errors
            setError(details ? details.join('\n') : msg)
        }
    }

    return (
        <div className="min-h-screen bg-grain">
            <div className="bg-gradient-secondary-to-white min-h-screen">
                <div className={cn('max-w-7xl mx-auto p-6', cartPaddingBottom)}>
                    <PageHeader title="Tableaux disponibles" icon={LayoutGridIcon} backLink="/" />

                    {/* Aide inscription */}
                    <div className="mb-6">
                        <RegistrationHelp steps={REGISTRATION_STEPS} />
                    </div>

                    {/* Alerte période d'inscription */}
                    {registrationStatus && (
                        <div className="mb-6">
                            <RegistrationStatusAlert status={registrationStatus} />
                        </div>
                    )}

                    {/* Panneau d'inscription (seulement si période ouverte) */}
                    {isRegistrationOpen && (
                        <div className="animate-on-load animate-slide-up animation-delay-200 mb-6">
                            <RegistrationPanel
                                player={player}
                                onPlayerSelect={handlePlayerSelect}
                                onPlayerClear={handlePlayerClear}
                            />
                        </div>
                    )}

                    {/* Erreur */}
                    {error && (
                        <div className="animate-on-load animate-scale-in mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md whitespace-pre-line">
                            <div className="flex items-center gap-2 font-bold mb-1">
                                <AlertCircle className="w-4 h-4" />
                                Erreur
                            </div>
                            {error}
                        </div>
                    )}

                    {/* Filtres */}
                    {player && (
                        <div className="animate-on-load animate-slide-up animation-delay-300 mb-6">
                            <TableFilters
                                showEligibleOnly={showEligibleOnly}
                                onShowEligibleOnlyChange={setShowEligibleOnly}
                            />
                        </div>
                    )}

                    {/* Liste des tableaux */}
                    {isLoading ? (
                        <div className="p-8 text-center">Chargement des tableaux...</div>
                    ) : (
                        <div className="grid gap-4 animate-on-load animate-slide-up animation-delay-400">
                            {filteredTables?.map((table) => {
                                const eligibleTable = table as EligibleTable
                                const isEligible = player ? eligibleTable.isEligible : false
                                const isEffectivelyFull = table.registeredCount + table.waitlistCount >= table.quota

                                // Vérifier si bloqué par la sélection actuelle
                                const blockedByTimeConflict =
                                    player && isEligible && isBlockedByTimeConflict(eligibleTable)
                                const blockedByDailyLimit = player && isEligible && isBlockedByDailyLimit(eligibleTable)
                                const blockedBySelection = blockedByTimeConflict || blockedByDailyLimit

                                let blockedReason = undefined
                                if (blockedByTimeConflict) blockedReason = 'Même horaire'
                                else if (blockedByDailyLimit)
                                    blockedReason =
                                        'Un maximum de deux tableaux par jour est autorisé (hors tableaux spéciaux)'

                                return (
                                    <TableCard
                                        key={table.id}
                                        table={table}
                                        variant="public"
                                        player={player}
                                        isSelected={selectedTableIds.includes(table.id)}
                                        isBlocked={!!blockedBySelection}
                                        blockedReason={blockedReason}
                                        isEffectivelyFull={isEffectivelyFull}
                                        onToggle={handleToggle}
                                    />
                                )
                            })}

                            {filteredTables?.length === 0 && (
                                <div className="text-center p-8 bg-secondary border-2 border-dashed border-foreground">
                                    <p className="font-bold text-muted-foreground">
                                        {tables?.length === 0
                                            ? 'Aucun tableau disponible pour ce tournoi.'
                                            : 'Aucun tableau ne correspond aux filtres sélectionnés.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Panier */}
                    {player && (
                        <CartSummary
                            selectedTables={selectedTables}
                            onRemove={handleRemove}
                            onSubmit={handleSubmit}
                            isSubmitting={createRegistrations.isPending}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
