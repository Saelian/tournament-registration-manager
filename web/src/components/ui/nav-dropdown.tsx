import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { buttonVariants } from './button'
import { cn } from '@lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

export interface NavDropdownItem {
  to: string
  label: string
  icon?: React.ElementType
}

export interface NavDropdownProps {
  label: string
  icon?: React.ElementType
  items: NavDropdownItem[]
  className?: string
}

export function NavDropdown({ label, icon: Icon, items, className }: NavDropdownProps) {
  const location = useLocation()

  // Vérifie si une des routes du dropdown est active
  const isActive = items.some((item) => location.pathname === item.to)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: isActive ? 'navActive' : 'nav', size: 'sm' }),
          className
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        <ChevronDown className="h-4 w-4 ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {items.map((item) => (
          <DropdownMenuItem key={item.to} asChild>
            <NavLink to={item.to} className="w-full cursor-pointer">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
