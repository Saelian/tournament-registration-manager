import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-foreground bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            Tournois
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="secondary" size="sm">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
