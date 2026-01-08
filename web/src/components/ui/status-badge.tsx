import type { ReactNode } from 'react'
import { cn } from '@lib/utils'
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  REGISTRATION_STATUS_LABELS,
  PAYMENT_METHOD_COLORS,
  PAYMENT_METHOD_LABELS,
} from '@constants/status-mappings'

type StatusType = 'payment' | 'registration' | 'paymentMethod'

interface StatusBadgeProps {
  status: string
  type: StatusType
  icon?: ReactNode
  className?: string
}

const STATUS_CONFIGS: Record<
  StatusType,
  { colors: Record<string, string>; labels: Record<string, string> }
> = {
  payment: {
    colors: PAYMENT_STATUS_COLORS,
    labels: PAYMENT_STATUS_LABELS,
  },
  registration: {
    colors: REGISTRATION_STATUS_COLORS,
    labels: REGISTRATION_STATUS_LABELS,
  },
  paymentMethod: {
    colors: PAYMENT_METHOD_COLORS,
    labels: PAYMENT_METHOD_LABELS,
  },
}

/**
 * Composant badge de statut réutilisable
 * Utilise les constantes centralisées pour les couleurs et labels
 */
export function StatusBadge({ status, type, icon, className }: StatusBadgeProps) {
  const config = STATUS_CONFIGS[type]
  const colorClass = config.colors[status] || 'bg-gray-200 text-gray-900 border-gray-600'
  const label = config.labels[status] || status

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border',
        colorClass,
        className
      )}
    >
      {icon}
      {label}
    </span>
  )
}
