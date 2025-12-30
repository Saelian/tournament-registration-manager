import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface HeroProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  description?: string
  cta?: ReactNode
  backgroundVariant?: 'default' | 'primary' | 'secondary'
}

const Hero = forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      className,
      title,
      subtitle,
      description,
      cta,
      backgroundVariant = 'default',
      children,
      ...props
    },
    ref
  ) => {
    const bgClasses = {
      default: 'bg-card',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'p-8 md:p-12 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          bgClasses[backgroundVariant],
          className
        )}
        {...props}
      >
        {subtitle && (
          <div className="inline-block bg-primary text-primary-foreground px-3 py-1 text-sm font-bold mb-4 border-2 border-foreground">
            {subtitle}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight">{title}</h1>
        {description && (
          <p
            className={cn(
              'text-lg md:text-xl mb-6 max-w-2xl',
              backgroundVariant === 'primary'
                ? 'text-primary-foreground/90'
                : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
        {children}
        {cta && <div className="mt-6">{cta}</div>}
      </div>
    )
  }
)
Hero.displayName = 'Hero'

export { Hero }
export type { HeroProps }
