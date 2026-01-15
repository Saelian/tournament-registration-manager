import { formatPrice } from '@lib/formatters'
import { Button } from '@components/ui/button'
import { ShoppingCart, AlertTriangle, X, Info } from 'lucide-react'
import type { EligibleTable } from '../../../tables/types'
import { cn } from '@lib/utils'

interface CartSummaryProps {
    selectedTables: EligibleTable[]
    onRemove: (tableId: number) => void
    onSubmit: () => void
    isSubmitting: boolean
}

export function CartSummary({ selectedTables, onRemove, onSubmit, isSubmitting }: CartSummaryProps) {
    if (selectedTables.length === 0) {
        return null
    }

    // Separate direct registrations from waitlist
    // A table is "effectively full" if registered + existing waitlist >= quota
    const directTables = selectedTables.filter((t) => t.registeredCount + t.waitlistCount < t.quota)
    const waitlistTables = selectedTables.filter((t) => t.registeredCount + t.waitlistCount >= t.quota)

    // Only direct registrations count towards payment
    const totalPrice = directTables.reduce((sum, t) => sum + t.price, 0)

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-foreground shadow-[0_-4px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="max-w-4xl mx-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <h3 className="font-bold text-lg">
                        Panier ({selectedTables.length} tableau{selectedTables.length > 1 ? 'x' : ''})
                    </h3>
                </div>

                {/* Grille articles + total/bouton */}
                <div className="grid grid-cols-[1fr_auto] gap-4 mb-4 items-end">
                    {/* Grille des articles (2 colonnes max) */}
                    <div className="grid grid-cols-2 gap-3 pb-2">
                        {directTables.map((table) => (
                            <div
                                key={table.id}
                                className="flex items-center justify-between gap-2 bg-card px-3 py-2 neo-brutal"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {table.referenceLetter && (
                                        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 font-bold border border-foreground">
                                            {table.referenceLetter}
                                        </span>
                                    )}
                                    <span className="font-semibold truncate">{table.name}</span>
                                    <span className="text-muted-foreground text-sm shrink-0">
                                        {formatPrice(table.price)} €
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemove(table.id)}
                                    className="p-1 hover:bg-destructive/10 transition-colors shrink-0"
                                    aria-label={`Retirer ${table.name}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {waitlistTables.map((table) => (
                            <div
                                key={table.id}
                                className={cn(
                                    'flex items-center justify-between gap-2 bg-amber-50 px-3 py-2 neo-brutal border-amber-300',
                                    'dark:bg-amber-900/20 dark:border-amber-700'
                                )}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    {table.referenceLetter && (
                                        <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 font-bold border border-amber-300">
                                            {table.referenceLetter}
                                        </span>
                                    )}
                                    <span className="font-semibold truncate">{table.name}</span>
                                    <span className="text-xs text-amber-600 shrink-0">(attente)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemove(table.id)}
                                    className="p-1 hover:bg-destructive/10 transition-colors shrink-0"
                                    aria-label={`Retirer ${table.name}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Total et bouton - aligné en bas avec marge pour l'ombre */}
                    <div className="flex flex-col items-end gap-2 pb-2">
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                                Total {waitlistTables.length > 0 && '(hors attente)'}
                            </div>
                            <div className="text-3xl font-bold">{formatPrice(totalPrice)} €</div>
                        </div>
                        <Button
                            size="lg"
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className="shadow-shadow neo-brutal-hover"
                        >
                            {isSubmitting ? 'Redirection...' : "Valider l'inscription"}
                        </Button>
                    </div>
                </div>

                {/* Bloc d'information sur le paiement */}
                <div className="bg-card neo-brutal p-3 text-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <p className="flex items-center gap-4 flex-1">
                            <Info className="w-8 h-8 text-primary shrink-0" />
                            <span>
                                En cliquant sur <strong>"Valider l'inscription"</strong>, vous serez redirigé vers Hello
                                Asso pour procéder au paiement.
                                <br />
                                <br />
                                <strong>Important :</strong> En cas de non paiement, vos inscriptions seront
                                automatiquement annulées après 30 minutes.
                                <br />
                                En cas de difficulté rencontrée lors du paiement, vous pouvez procéder à nouveau à ce
                                dernier depuis votre espace.
                            </span>
                        </p>
                    </div>
                </div>

                {waitlistTables.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-3">
                        Liste d'attente : non facturée immédiatement. Notification par mail si place libre (24h pour
                        payer).
                    </p>
                )}
            </div>
        </div>
    )
}
