import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
    <>
      {backLink && (
        <div className="mb-6">
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 bg-card neo-brutal px-4 py-2 text-sm font-bold hover:-translate-y-0.5 hover:shadow-shadow transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        </div>
      )}

      <div className={cn('bg-card neo-brutal p-6 mb-6', className)}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="animate-on-load animate-slide-in-left animation-delay-100 text-3xl font-black flex items-center gap-3">
              {Icon && <Icon className="h-8 w-8 text-primary" />}
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
    </>
  )
}
