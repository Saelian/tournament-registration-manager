import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type BadgeVariant =
    | 'primary'
    | 'special'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral'
    | 'pink'
    | 'blue'
    | 'green'
    | 'purple'

interface TableBadgeProps {
    children: React.ReactNode
    variant?: BadgeVariant
    icon?: LucideIcon
    className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
    primary: 'bg-primary text-primary-foreground border-foreground',
    special: 'bg-yellow-300 text-black border-foreground',
    success: 'bg-green-100 text-green-700 border-green-300',
    warning: 'bg-amber-100 text-amber-700 border-amber-300',
    error: 'bg-destructive text-destructive-foreground',
    info: 'bg-blue-100 text-blue-700 border-blue-300',
    neutral: 'bg-gray-100 text-gray-600 border-gray-300',
    pink: 'bg-pink-200 text-foreground border-foreground',
    blue: 'bg-blue-200 text-foreground border-foreground',
    green: 'bg-green-200 text-foreground border-foreground',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
}

export function TableBadge({
    children,
    variant = 'neutral',
    icon: Icon,
    className,
}: TableBadgeProps) {
    return (
        <span
            className={cn(
                'text-xs px-2 py-1 font-bold border flex items-center gap-1',
                variantStyles[variant],
                className
            )}
        >
            {Icon && <Icon className="w-3 h-3 shrink-0" />}
            {children}
        </span>
    )
}
