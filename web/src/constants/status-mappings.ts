/**
 * Mappages centralisés pour les statuts de paiement et d'inscription
 * Utilisés dans toute l'application admin
 */

// === STATUTS DE PAIEMENT ===

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  succeeded: 'Payé',
  failed: 'Échec',
  expired: 'Expiré',
  refunded: 'Remboursé',
  refund_pending: 'Remboursement en cours',
  refund_failed: 'Remboursement échoué',
  refund_requested: 'Remboursement demandé',
}

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-200 text-yellow-900 border-yellow-600',
  succeeded: 'bg-green-200 text-green-900 border-green-600',
  failed: 'bg-red-200 text-red-900 border-red-600',
  expired: 'bg-secondary text-muted-foreground border-foreground/50',
  refunded: 'bg-blue-200 text-blue-900 border-blue-600',
  refund_pending: 'bg-blue-100 text-blue-800 border-blue-500',
  refund_failed: 'bg-red-200 text-red-900 border-red-600',
  refund_requested: 'bg-orange-200 text-orange-900 border-orange-600',
}

export const PAYMENT_STATUS_FILTERS = [
  { value: 'succeeded', label: 'Payé' },
  { value: 'refund_requested', label: 'Remboursement demandé' },
  { value: 'refunded', label: 'Remboursé' },
  { value: 'pending', label: 'En attente' },
  { value: 'failed', label: 'Échoué' },
]

// === STATUTS D'INSCRIPTION ===

export const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  paid: 'Payé',
  pending_payment: 'En attente de paiement',
  waitlist: "Liste d'attente",
  cancelled: 'Annulé',
}

export const REGISTRATION_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 border-green-300',
  pending_payment: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  waitlist: 'bg-orange-100 text-orange-700 border-orange-300',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-300',
}

// Variante avec couleurs plus saturées (pour les modales de détails)
export const REGISTRATION_STATUS_COLORS_SATURATED: Record<string, string> = {
  pending_payment: 'bg-yellow-200 text-yellow-900 border-yellow-600',
  paid: 'bg-green-200 text-green-900 border-green-600',
  waitlist: 'bg-orange-200 text-orange-900 border-orange-600',
  cancelled: 'bg-secondary text-muted-foreground border-foreground/50',
}

// === MAPPING BADGE VARIANTS (UI) ===
// Mappe les statuts techniques vers les variants du composant Badge

export const STATUS_BADGE_VARIANTS: Record<string, string> = {
  // Inscription
  paid: 'success',
  pending_payment: 'warning',
  waitlist: 'special',
  cancelled: 'neutral',

  // Paiement
  succeeded: 'success',
  pending: 'warning',
  failed: 'error',
  expired: 'neutral',
  refunded: 'info',
  refund_pending: 'info',
  refund_failed: 'error',
  refund_requested: 'warning',
}

// === MÉTHODES DE PAIEMENT ===

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  helloasso: 'HelloAsso',
  cash: 'Espèces',
  check: 'Chèque',
  card: 'Carte bancaire',
}

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  helloasso: 'bg-purple-200 text-purple-900 border-purple-600',
  cash: 'bg-green-200 text-green-900 border-green-600',
  check: 'bg-blue-200 text-blue-900 border-blue-600',
  card: 'bg-indigo-200 text-indigo-900 border-indigo-600',
}

export const PAYMENT_METHOD_FILTERS = [
  { value: 'helloasso', label: 'HelloAsso' },
  { value: 'cash', label: 'Espèces' },
  { value: 'check', label: 'Chèque' },
  { value: 'card', label: 'Carte bancaire' },
]

// === MÉTHODES DE REMBOURSEMENT ===

export const REFUND_METHOD_LABELS: Record<string, string> = {
  helloasso_manual: 'HelloAsso (manuel)',
  bank_transfer: 'Virement',
  cash: 'Espèces',
}
