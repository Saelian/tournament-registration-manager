import { useState } from 'react'
import { formatPrice } from '@lib/formatters'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@components/ui/dialog'
import { ShoppingCart, AlertTriangle, X, Info } from 'lucide-react'
import type { EligibleTable } from '../../../tables/types'
import { cn } from '@lib/utils'

interface CartSummaryProps {
  selectedTables: EligibleTable[]
  onRemove: (tableId: number) => void
  onSubmit: () => void
  isSubmitting: boolean
  waitlistTimerHours: number
}

export function CartSummary({
  selectedTables,
  onRemove,
  onSubmit,
  isSubmitting,
  waitlistTimerHours,
}: CartSummaryProps) {
  const [showInfoModal, setShowInfoModal] = useState(false)

  if (selectedTables.length === 0) {
    return null
  }

  // Separate direct registrations from waitlist
  // A table is "effectively full" if registered + existing waitlist >= quota
  const directTables = selectedTables.filter((t) => t.registeredCount + t.waitlistCount < t.quota)
  const waitlistTables = selectedTables.filter((t) => t.registeredCount + t.waitlistCount >= t.quota)

  // Only direct registrations count towards payment
  const totalPrice = directTables.reduce((sum, t) => sum + t.price, 0)

  // Contenu informatif partagé entre le Dialog et la version desktop
  const infoContent = (
    <>
      {directTables.length > 0 && waitlistTables.length === 0 && (
        <>
          En cliquant sur <strong>"Valider l'inscription"</strong>, vous serez redirigé vers Hello Asso pour
          procéder au paiement.
          <br />
          <br />
          <strong>Important :</strong> En cas de non paiement, vos inscriptions seront automatiquement
          annulées après <strong>30 minutes</strong>.
          <br />
          En cas de difficulté rencontrée lors du paiement, vous pouvez procéder à nouveau à ce dernier depuis
          votre espace.
        </>
      )}
      {directTables.length === 0 && waitlistTables.length > 0 && (
        <>
          Vous avez sélectionné uniquement des tableaux en <strong>liste d'attente</strong>. En cliquant sur{' '}
          <strong>"Valider l'inscription"</strong>, vous serez inscrit en liste d'attente sans paiement
          immédiat.
          <br />
          <br />
          Si une place se libère, vous recevrez un email et disposerez de{' '}
          <strong>{waitlistTimerHours} heures</strong> pour procéder au paiement depuis votre espace.
        </>
      )}
      {directTables.length > 0 && waitlistTables.length > 0 && (
        <>
          En cliquant sur <strong>"Valider l'inscription"</strong>, vous serez redirigé vers Hello Asso pour
          payer vos <strong>{directTables.length} inscription(s)</strong>.
          <br />
          Vos <strong>{waitlistTables.length} tableau(x) en liste d'attente</strong> seront enregistrés sans
          paiement immédiat.
          <br />
          <br />
          <strong>Important :</strong> En cas de non paiement, vos inscriptions confirmées seront
          automatiquement annulées après <strong>30 minutes</strong>.
          <br />
          Si une place se libère sur un tableau en attente, vous recevrez un email et disposerez de{' '}
          <strong>{waitlistTimerHours} heures</strong> pour payer.
        </>
      )}
    </>
  )

  return (
    <>
      {/* Dialog mobile pour les infos */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Informations importantes
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-left">{infoContent}</div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-foreground shadow-[0_-4px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          {/* Header avec bouton info sur mobile */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              <h3 className="font-bold text-base md:text-lg">
                Panier ({selectedTables.length} tableau{selectedTables.length > 1 ? 'x' : ''})
              </h3>
            </div>
            {/* Bouton info visible uniquement sur mobile */}
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="md:hidden p-2 bg-primary/10 hover:bg-primary/20 transition-colors border border-foreground neo-brutal"
              aria-label="Voir les informations importantes"
            >
              <Info className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Grille articles + total/bouton */}
          <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-2 md:gap-4 md:items-end">
            {/* Grille des articles (1 col sur mobile, 2 cols sur tablette+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {directTables.map((table) => (
                <div key={table.id} className="flex items-center justify-between gap-2 bg-card px-2 md:px-3 py-1.5 md:py-2 neo-brutal">
                  <div className="flex items-center gap-2 min-w-0">
                    {table.referenceLetter && (
                      <span className="bg-primary text-primary-foreground text-xs px-1 md:px-1.5 py-0.5 font-bold border border-foreground shrink-0">
                        {table.referenceLetter}
                      </span>
                    )}
                    <span className="font-semibold truncate text-sm md:text-base">{table.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                    <span className="text-muted-foreground text-xs md:text-sm">{formatPrice(table.price)} €</span>
                    <button
                      type="button"
                      onClick={() => onRemove(table.id)}
                      className="p-1 hover:bg-destructive/10 transition-colors"
                      aria-label={`Retirer ${table.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {waitlistTables.map((table) => (
                <div
                  key={table.id}
                  className={cn(
                    'flex items-center justify-between gap-2 bg-amber-50 px-2 md:px-3 py-1.5 md:py-2 neo-brutal border-amber-300',
                    'dark:bg-amber-900/20 dark:border-amber-700'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    {table.referenceLetter && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-1 md:px-1.5 py-0.5 font-bold border border-amber-300 shrink-0">
                        {table.referenceLetter}
                      </span>
                    )}
                    <span className="font-semibold truncate text-sm md:text-base">{table.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                    <span className="text-xs text-amber-600">(attente)</span>
                    <button
                      type="button"
                      onClick={() => onRemove(table.id)}
                      className="p-1 hover:bg-destructive/10 transition-colors"
                      aria-label={`Retirer ${table.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total et bouton */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-foreground/20">
              <div className="text-left md:text-right">
                <div className="text-xs md:text-sm text-muted-foreground">Total {waitlistTables.length > 0 && '(hors attente)'}</div>
                <div className="text-xl md:text-3xl font-bold">{formatPrice(totalPrice)} €</div>
              </div>
              <Button size="default" onClick={onSubmit} disabled={isSubmitting} className="shadow-shadow neo-brutal-hover shrink-0 text-sm md:text-base">
                {isSubmitting ? 'Redirection...' : "Valider l'inscription"}
              </Button>
            </div>
          </div>

          {/* Bloc d'information contextuel - visible uniquement sur desktop */}
          <div className="hidden md:block bg-card neo-brutal p-3 text-sm mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <p className="flex items-center gap-4 flex-1">
                <Info className="w-8 h-8 text-primary shrink-0" />
                <span>{infoContent}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
