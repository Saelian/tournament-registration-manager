import { Link } from 'react-router-dom'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type { User as UserType } from '../../features/auth/types'

interface UserMenuProps {
  user: UserType
  onLogout: () => void
  isLoggingOut: boolean
}

function getInitials(user: UserType): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }
  return user.email.charAt(0).toUpperCase()
}

export function UserMenu({ user, onLogout, isLoggingOut }: UserMenuProps) {
  const initials = getInitials(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <Avatar className="border-2 border-foreground">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Mes inscriptions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          disabled={isLoggingOut}
          variant="destructive"
          className="cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
