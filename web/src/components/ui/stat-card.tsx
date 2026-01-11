import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    label?: string
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, icon, trend, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-card',
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-green-100 border-green-600',
      warning: 'bg-yellow-100 border-yellow-600',
      danger: 'bg-red-100 border-red-600',
    }

    const getTrendIcon = () => {
      if (!trend) return null
      if (trend.value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
      if (trend.value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
      return <Minus className="w-4 h-4 text-muted-foreground" />
    }

    const getTrendColor = () => {
      if (!trend) return ''
      if (trend.value > 0) return 'text-green-600'
      if (trend.value < 0) return 'text-red-600'
      return 'text-muted-foreground'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'p-6 neo-brutal',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between mb-2">
          <span
            className={cn(
              'text-sm font-medium',
              variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
          {icon && (
            <div
              className={cn(
                'p-2 border-2 border-foreground',
                variant === 'primary' ? 'bg-primary-foreground/20' : 'bg-secondary'
              )}
            >
              {icon}
            </div>
          )}
        </div>
        <div
          className={cn(
            'text-3xl font-black mb-1',
            variant === 'primary' ? 'text-primary-foreground' : 'text-foreground'
          )}
        >
          {value}
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-sm', getTrendColor())}>
            {getTrendIcon()}
            <span className="font-medium">
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </span>
            {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </div>
    )
  }
)
StatCard.displayName = 'StatCard'

export { StatCard }
export type { StatCardProps }
