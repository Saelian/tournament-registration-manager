import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { ElementType, ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string | ReactNode
  icon?: ElementType
  actions?: ReactNode
  backLink?: string
  backLabel?: string
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  backLink,
  backLabel = "Retour à l'accueil",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {backLink && (
        <Link
          to={backLink}
          className="animate-on-load animate-slide-in-left text-primary hover:underline text-sm mb-4 inline-block"
        >
          ← {backLabel}
        </Link>
      )}

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="animate-on-load animate-slide-in-left animation-delay-100 text-3xl font-black flex items-center gap-3">
            {Icon && <Icon className="h-8 w-8" />}
            {title}
          </h1>
          {description && (
            <div className="animate-on-load animate-slide-in-left animation-delay-200 text-muted-foreground">
              {description}
            </div>
          )}
        </div>

        {actions && (
          <div className="animate-on-load animate-slide-in-left animation-delay-300 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
