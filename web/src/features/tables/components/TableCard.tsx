import { UsersIcon, Check, Clock, Ban, TrophyIcon, EditIcon, Trash2Icon } from 'lucide-react'
import { formatDate, formatTime, formatPrice } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TableBadge } from './TableBadge'
import type { Table, EligibleTable } from '../types'
import type { Player } from '../../registrations/types/registrationTypes'

const INELIGIBILITY_LABELS: Record<string, string> = {
  POINTS_TOO_LOW: 'Points insuffisants',
  POINTS_TOO_HIGH: 'Points trop élevés',
  DAILY_LIMIT_REACHED: 'Limite journalière atteinte',
  TIME_CONFLICT: "Conflit d'horaire",
  GENDER_RESTRICTED: 'Réservé à un autre genre',
  CATEGORY_RESTRICTED: 'Catégorie non autorisée',
  ALREADY_REGISTERED: 'Déjà inscrit',
  NUMBERED_PLAYER_RESTRICTED: 'Réservé aux non numérotés',
  WAITLIST_PRIORITY: "Réservé à la liste d'attente",
}

interface TableCardProps {
  table: Table | EligibleTable
  variant?: 'public' | 'admin'

  // Props contextuelles
  player?: Player | null
  isSelected?: boolean

  // États calculés par le parent
  isBlocked?: boolean // ex: conflit avec sélection actuelle
  blockedReason?: string // ex: "Même horaire"
  isEffectivelyFull?: boolean // ex: complet + liste d'attente

  // Actions
  onToggle?: (id: number) => void
  onEdit?: (table: Table) => void
  onDelete?: (table: Table) => void
}

export function TableCard({
  table,
  variant = 'public',
  player,
  isSelected = false,
  isBlocked = false,
  blockedReason,
  isEffectivelyFull = false,
  onToggle,
  onEdit,
  onDelete,
}: TableCardProps) {
  const eligibleTable = table as EligibleTable
  // On ne considère eligible que si la propriété existe et est vraie
  // Pour l'admin, on s'en fiche un peu, mais ça évite des erreurs
  const isEligible = 'isEligible' in table ? table.isEligible : true

  const fillRate = Math.min(100, Math.round((table.registeredCount / table.quota) * 100))

  const isFull = table.registeredCount >= table.quota

  // Badges logic
  const isAlreadyRegistered = eligibleTable.ineligibilityReasons?.includes('ALREADY_REGISTERED')
  const hasTimeConflict = eligibleTable.ineligibilityReasons?.includes('TIME_CONFLICT')
  const hasDailyLimitFromApi = eligibleTable.ineligibilityReasons?.includes('DAILY_LIMIT_REACHED')
  const hasWaitlistPriority = eligibleTable.ineligibilityReasons?.includes('WAITLIST_PRIORITY')

  // Selection logic (public)
  const canSelect = variant === 'public' && player && isEligible && !isBlocked

  const handleClick = () => {
    if (variant === 'public' && canSelect && onToggle) {
      onToggle(table.id)
    }
  }

  return (
    <div
      className={cn(
        'relative bg-card p-4 border-2 transition-all select-none',
        // Styles conditionnels selon le mode et l'état
        variant === 'public' && canSelect
          ? 'cursor-pointer hover:shadow-[6px_6px_0px_0px] hover:shadow-foreground'
          : 'cursor-default',
        variant === 'public' && !player && 'opacity-70',
        variant === 'public' && player && !isEligible && 'opacity-60 grayscale-[0.5]',
        variant === 'public' && isBlocked && 'opacity-50',

        // Style de sélection/bordure
        isSelected
          ? 'border-primary shadow-[4px_4px_0px_0px_var(--primary)]'
          : 'border-foreground shadow-shadow'
      )}
      onClick={handleClick}
    >
      {/* Indicateur de sélection visible */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 z-10">
          <Check className="w-6 h-6" />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          {/* Header Badges & Title */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {table.referenceLetter && (
              <div className="bg-primary w-8 h-8 text-primary-foreground text-sm px-2 py-1 font-bold border-2 border-foreground flex items-center justify-center">
                {table.referenceLetter}
              </div>
            )}

            <h3 className="text-xl font-bold">{table.name}</h3>

            {table.isSpecial && <TableBadge variant="special">Spécial</TableBadge>}

            {/* Badges Public spécifiques */}
            {variant === 'public' && player && (
              <>
                {isAlreadyRegistered && (
                  <TableBadge variant="success" icon={Check}>
                    Déjà inscrit
                  </TableBadge>
                )}

                {hasTimeConflict && !isAlreadyRegistered && (
                  <TableBadge variant="warning" icon={Ban}>
                    Conflit d'horaire
                  </TableBadge>
                )}

                {hasDailyLimitFromApi && !isAlreadyRegistered && !hasTimeConflict && (
                  <TableBadge variant="warning" icon={Ban}>
                    Max 2 tableaux/jour (hors spéciaux)
                  </TableBadge>
                )}

                {/* Blocages dynamiques (calculés par le parent) */}
                {isBlocked && blockedReason && (
                  <TableBadge
                    variant={
                      blockedReason.includes('attente') || blockedReason.includes('Même horaire')
                        ? 'neutral'
                        : 'warning'
                    }
                    icon={blockedReason === 'Même horaire' ? Clock : Ban}
                  >
                    {blockedReason}
                  </TableBadge>
                )}

                {isEffectivelyFull && isEligible && !isBlocked && (
                  <TableBadge variant="warning" icon={Clock}>
                    Liste d'attente
                  </TableBadge>
                )}

                {hasWaitlistPriority && (
                  <TableBadge variant="purple" icon={Clock}>
                    Réservé à la liste d'attente
                  </TableBadge>
                )}

                {!isEligible && !isAlreadyRegistered && !hasTimeConflict && (
                  <TableBadge variant="error">Inéligible</TableBadge>
                )}
              </>
            )}

            {/* Badges Communs */}
            {table.genderRestriction === 'F' && <TableBadge variant="pink">Féminin</TableBadge>}
            {table.genderRestriction === 'M' && <TableBadge variant="blue">Masculin</TableBadge>}
            {table.nonNumberedOnly && <TableBadge variant="green">Non numéroté</TableBadge>}
          </div>

          {/* Messages d'inéligibilité (Public) */}
          {variant === 'public' &&
            player &&
            !isEligible &&
            eligibleTable.ineligibilityReasons?.length > 0 &&
            !isAlreadyRegistered && (
              <div className="text-xs text-muted-foreground font-medium mb-2">
                {eligibleTable.ineligibilityReasons
                  .filter((r) => r !== 'ALREADY_REGISTERED' && r !== 'TIME_CONFLICT')
                  .map((r) => INELIGIBILITY_LABELS[r] || r)
                  .join(', ')}
              </div>
            )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-bold">Date:</span> {formatDate(table.date)}
            </div>
            <div>
              <span className="font-bold">Début:</span> {formatTime(table.startTime)}
            </div>
            <div>
              <span className="font-bold">Points:</span> {table.pointsMin} - {table.pointsMax}
            </div>
            <div>
              <span className="font-bold">Prix:</span> {formatPrice(table.price)} €
            </div>
          </div>

          {/* Categories */}
          {table.allowedCategories && table.allowedCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs font-bold text-muted-foreground">Catégories:</span>
              {table.allowedCategories.map((cat) => (
                <span
                  key={cat}
                  className="bg-secondary text-xs px-2 py-0.5 border border-foreground rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Admin specific: Pointage avant */}
          {variant === 'admin' && table.effectiveCheckinTime && (
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="font-bold">Pointage avant:</span>{' '}
              {formatTime(table.effectiveCheckinTime)}
            </div>
          )}

          {/* Prizes / Cash Prize */}
          {(table.totalCashPrize > 0 || table.prizes?.length > 0) && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <TrophyIcon className="w-4 h-4 text-yellow-600" />
              {table.totalCashPrize > 0 ? (
                <span className="font-bold text-yellow-700">
                  {formatPrice(table.totalCashPrize)} € de dotation
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {table.prizes.length} lot{table.prizes.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Sponsors */}
          {table.sponsors?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="text-xs font-bold text-muted-foreground">Sponsors:</span>
              {table.sponsors.map((sponsor) => (
                <span
                  key={sponsor.id}
                  className="bg-blue-100 text-xs px-2 py-0.5 border border-blue-300 rounded"
                >
                  {sponsor.name}
                </span>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold flex items-center gap-1">
                <UsersIcon className="w-3 h-3" />
                {variant === 'public' ? 'Places:' : 'Inscrits:'} {table.registeredCount} /{' '}
                {table.quota}
                {table.waitlistCount > 0 && (
                  <span className="text-amber-600 ml-1">(+{table.waitlistCount} en attente)</span>
                )}
              </span>
              <span>{fillRate}%</span>
            </div>
            <Progress
              value={fillRate}
              className="h-2"
              indicatorClassName={cn(
                isFull ? (variant === 'public' ? 'bg-amber-500' : 'bg-destructive') : 'bg-primary',
                variant === 'admin' && !isFull && fillRate >= 80 && 'bg-yellow-500'
              )}
            />
          </div>
        </div>

        {/* Actions Admin */}
        {variant === 'admin' && (
          <div className="flex md:flex-col justify-end gap-2">
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(table)
                }}
              >
                <EditIcon className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                className="bg-card text-foreground"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(table)
                }}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
