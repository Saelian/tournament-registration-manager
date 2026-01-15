/**
 * Helpers de formatage partagés pour l'affichage des données
 */

import {
    REGISTRATION_STATUS_LABELS,
    REGISTRATION_STATUS_COLORS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
} from '@constants/status-mappings'

/**
 * Retourne le nom complet d'un subscriber ou son email si pas de nom
 */
export function getSubscriberName(subscriber: {
    firstName?: string | null
    lastName?: string | null
    email: string
}): string {
    if (subscriber.firstName || subscriber.lastName) {
        return `${subscriber.firstName ?? ''} ${subscriber.lastName ?? ''}`.trim()
    }
    return subscriber.email
}

/**
 * Formate une date en format court français (ex: "sam. 15 janv.")
 */
export function formatDateShort(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}

/**
 * Formate une date/heure en format français complet (ex: "15 janv. 2024, 14:30")
 */
export function formatDateTimeLong(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Formate un montant en centimes vers un prix affiché en euros
 */
export function formatCurrency(amountInCents: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amountInCents / 100)
}

/**
 * Retourne le label et la classe CSS pour un statut d'inscription
 */
export function getRegistrationStatusInfo(status: string): { label: string; className: string } {
    return {
        label: REGISTRATION_STATUS_LABELS[status] ?? status,
        className: REGISTRATION_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500 border-gray-300',
    }
}

/**
 * Retourne le label et une classe de couleur texte pour un statut d'inscription
 * (utilisé dans les vues détails où on veut juste la couleur du texte)
 */
export function getRegistrationStatusText(status: string): { label: string; className: string } {
    const textColors: Record<string, string> = {
        paid: 'text-green-700',
        pending_payment: 'text-yellow-700',
        waitlist: 'text-blue-700',
        cancelled: 'text-red-700',
    }
    return {
        label: REGISTRATION_STATUS_LABELS[status] ?? status,
        className: textColors[status] ?? 'text-gray-700',
    }
}

/**
 * Retourne le label et une classe de couleur texte pour un statut de paiement
 */
export function getPaymentStatusText(status: string): { label: string; className: string } {
    const textColors: Record<string, string> = {
        succeeded: 'text-green-700',
        pending: 'text-yellow-700',
        failed: 'text-red-700',
        refunded: 'text-purple-700',
        refund_requested: 'text-orange-700',
        refund_pending: 'text-blue-700',
        refund_failed: 'text-red-700',
        expired: 'text-gray-500',
    }
    return {
        label: PAYMENT_STATUS_LABELS[status] ?? status,
        className: textColors[status] ?? 'text-gray-700',
    }
}

/**
 * Retourne le label et la classe CSS pour un statut de paiement (badge)
 */
export function getPaymentStatusInfo(status: string): { label: string; className: string } {
    return {
        label: PAYMENT_STATUS_LABELS[status] ?? status,
        className: PAYMENT_STATUS_COLORS[status] ?? 'bg-gray-200 text-gray-900 border-gray-600',
    }
}
