import { formatPrice } from '../../lib/formatters'
import { Button } from '../../components/ui/button'
import { ShoppingCart, Clock, AlertTriangle, X } from 'lucide-react'
import type { EligibleTable } from '../tables/types'
import { cn } from '../../lib/utils'

interface CartSummaryProps {
  selectedTables: EligibleTable[]
  onRemove: (tableId: number) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function CartSummary({
  selectedTables,
  onRemove,
  onSubmit,
  isSubmitting,
}: CartSummaryProps) {
  if (selectedTables.length === 0) {
    return null
  }

  // Separate direct registrations from waitlist
  const directTables = selectedTables.filter((t) => t.registeredCount < t.quota)
  const waitlistTables = selectedTables.filter((t) => t.registeredCount >= t.quota)

  // Only direct registrations count towards payment
  const totalPrice = directTables.reduce((sum, t) => sum + t.price, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-foreground shadow-[0_-4px_0px_0px_rgba(0,0,0,0.1)]">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart className="w-5 h-5" />
          <h3 className="font-bold text-lg">
            Panier ({selectedTables.length} tableau{selectedTables.length > 1 ? 'x' : ''})
          </h3>
        </div>

        <div className="grid gap-2 mb-4 max-h-40 overflow-y-auto">
          {directTables.map((table) => (
            <div
              key={table.id}
              className="flex items-center justify-between bg-card p-2 border border-foreground rounded"
            >
              <div className="flex-1 flex items-center gap-2">
                {table.referenceLetter && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 font-bold border border-foreground rounded">
                    {table.referenceLetter}
                  </span>
                )}
                <span className="font-semibold">{table.name}</span>
                <span className="text-muted-foreground">{formatPrice(table.price)} €</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(table.id)}
                className="p-1 hover:bg-destructive/10 rounded transition-colors"
                aria-label={`Retirer ${table.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {waitlistTables.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">Liste d'attente</span>
              </div>
              {waitlistTables.map((table) => (
                <div
                  key={table.id}
                  className={cn(
                    'flex items-center justify-between bg-amber-50 p-2 border border-amber-300 rounded',
                    'dark:bg-amber-900/20 dark:border-amber-700'
                  )}
                >
                  <div className="flex-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    {table.referenceLetter && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 font-bold border border-amber-300 rounded">
                        {table.referenceLetter}
                      </span>
                    )}
                    <span className="font-semibold">{table.name}</span>
                    <span className="text-xs text-amber-600">(complet)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(table.id)}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    aria-label={`Retirer ${table.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              Total à payer {waitlistTables.length > 0 && "(hors liste d'attente)"}
            </div>
            <div className="text-2xl font-bold">{formatPrice(totalPrice)} €</div>
          </div>

          <Button
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {isSubmitting ? 'Redirection vers le paiement...' : "Valider l'inscription"}
          </Button>
        </div>

        {waitlistTables.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Les tables en liste d'attente ne seront pas facturées immédiatement. Vous serez notifié
            si une place se libère.
          </p>
        )}
      </div>
    </div>
  )
}
