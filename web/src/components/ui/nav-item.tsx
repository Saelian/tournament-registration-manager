import { NavLink } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { buttonVariants } from './button'
import { cn } from '../../lib/utils'

export interface NavItemProps {
  to: string
  label: string
  icon?: React.ElementType
  external?: boolean
  end?: boolean
  className?: string
}

export function NavItem({
  to,
  label,
  icon: Icon,
  external = false,
  end = false,
  className,
}: NavItemProps) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: 'nav', size: 'sm' }), className)}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        <ExternalLink className="h-3 w-3" />
      </a>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(buttonVariants({ variant: isActive ? 'navActive' : 'nav', size: 'sm' }), className)
      }
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </NavLink>
  )
}
