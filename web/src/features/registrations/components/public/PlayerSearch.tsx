import { useState } from 'react'
import { usePlayerSearch, useMyPlayers, useLinkPlayer } from '../../hooks'
import { useUserAuth } from '../../../auth'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import type { Player } from '../../types'
import { ApiError } from '../../../../lib/api'

interface PlayerSearchProps {
    onSelect: (player: Player) => void
}

export function PlayerSearch({ onSelect }: PlayerSearchProps) {
    const { isAuthenticated } = useUserAuth()
    const { data: myPlayers, isLoading: isLoadingPlayers } = useMyPlayers(isAuthenticated)
    const [licence, setLicence] = useState('')
    const { mutate: search, isPending, error, data, reset } = usePlayerSearch()
    const linkPlayer = useLinkPlayer()
    const [showManual, setShowManual] = useState(false)

    const hasPlayers = isAuthenticated && myPlayers && myPlayers.length > 0

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!licence) return
        search(licence)
        setShowManual(false)
    }

    const handleSelectMyPlayer = (player: Player) => {
        onSelect(player)
    }

    const isApiUnavailable =
        error instanceof ApiError &&
        error.status === 503 &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'allowManualEntry' in error.data &&
        (error.data as { allowManualEntry: boolean }).allowManualEntry

    if (showManual) {
        return (
            <ManualEntryForm
                initialLicence={licence}
                onSubmit={async (player) => {
                    // Persister le joueur en DB et le lier au compte
                    const persistedPlayer = await linkPlayer.mutateAsync(player)
                    onSelect(persistedPlayer)
                }}
                onCancel={() => {
                    setShowManual(false)
                    reset()
                }}
                isLoading={linkPlayer.isPending}
            />
        )
    }

    // Show loading state while fetching players
    if (isAuthenticated && isLoadingPlayers) {
        return (
            <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Section: Mes joueurs (si connecté et a des joueurs) */}
            {hasPlayers && (
                <div>
                    <h3 className="font-semibold mb-3">Mes joueurs</h3>
                    <div className="grid gap-2">
                        {myPlayers.map((player: Player) => (
                            <button
                                key={player.id}
                                type="button"
                                onClick={() => handleSelectMyPlayer(player)}
                                className="flex items-center justify-between p-3 border-2 border-border rounded-base bg-card hover:bg-main/10 transition-colors text-left"
                            >
                                <div>
                                    <p className="font-medium">
                                        {player.firstName} {player.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {player.club} - {player.points} pts
                                    </p>
                                </div>
                                <span className="text-sm text-muted-foreground">#{player.licence}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Section: Recherche par licence */}
            <div className={hasPlayers ? 'border-t pt-4' : ''}>
                {hasPlayers && <h3 className="font-semibold mb-3">Inscrire un joueur par son numéro de licence</h3>}
                <form onSubmit={handleSearch} className="flex gap-2 items-end">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="licence">Numéro de licence</Label>
                        <Input
                            id="licence"
                            value={licence}
                            onChange={(e) => setLicence(e.target.value)}
                            placeholder="Ex: 3421810"
                        />
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Recherche...' : 'Rechercher'}
                    </Button>
                </form>

                {error && !isApiUnavailable && (
                    <div className="text-red-500 text-sm mt-2">
                        {error instanceof ApiError ? error.message : 'Une erreur est survenue'}
                    </div>
                )}

                {isApiUnavailable && (
                    <div className="text-amber-600 text-sm space-y-2 mt-2">
                        <p>Le service de recherche est indisponible.</p>
                        <Button variant="outline" onClick={() => setShowManual(true)} type="button">
                            Saisir manuellement
                        </Button>
                    </div>
                )}

                {data && (
                    <div className="border p-4 rounded-md space-y-2 bg-slate-50 mt-4">
                        <h3 className="font-bold text-lg">
                            {data.firstName} {data.lastName}
                        </h3>
                        <div className="text-sm text-gray-600">
                            <p>Club: {data.club}</p>
                            <p>Points: {data.points}</p>
                            {data.category && <p>Catégorie: {data.category}</p>}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={async () => {
                                    // Persister le joueur en DB et le lier au compte
                                    const persistedPlayer = await linkPlayer.mutateAsync(data)
                                    onSelect(persistedPlayer)
                                }}
                                className="w-full"
                                disabled={linkPlayer.isPending}
                            >
                                {linkPlayer.isPending ? 'Chargement...' : 'Inscrire ce joueur'}
                            </Button>
                            <Button variant="ghost" onClick={reset} className="w-full" disabled={linkPlayer.isPending}>
                                Annuler
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ManualEntryForm({
    initialLicence,
    onSubmit,
    onCancel,
    isLoading = false,
}: {
    initialLicence: string
    onSubmit: (p: Player) => void
    onCancel: () => void
    isLoading?: boolean
}) {
    const [formData, setFormData] = useState<Partial<Player>>({
        licence: initialLicence,
        firstName: '',
        lastName: '',
        club: '',
        points: 500,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Basic validation
        if (!formData.licence || !formData.firstName || !formData.lastName || !formData.club) return

        onSubmit({
            ...(formData as Player),
            sex: null,
            category: null,
            needsVerification: true,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
            <h3 className="font-semibold">Saisie manuelle</h3>
            <div className="grid gap-2">
                <div className="grid gap-1">
                    <Label htmlFor="manual-licence">Licence</Label>
                    <Input
                        id="manual-licence"
                        value={formData.licence}
                        onChange={(e) => setFormData({ ...formData, licence: e.target.value })}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div className="grid gap-1">
                    <Label htmlFor="club">Club</Label>
                    <Input
                        id="club"
                        value={formData.club}
                        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-1">
                    <Label htmlFor="points">Points</Label>
                    <Input
                        id="points"
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Chargement...' : 'Valider'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Annuler
                </Button>
            </div>
        </form>
    )
}
