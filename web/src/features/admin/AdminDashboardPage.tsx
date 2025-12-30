import { Link } from 'react-router-dom'
import { Users, Euro, Percent, LayoutGrid, AlertTriangle, Calendar } from 'lucide-react'
import { StatCard } from '../../components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAdminStats } from './hooks'

export function AdminDashboardPage() {
  const { stats, tables, tournament, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Chargement du tableau de bord...</div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-secondary border-2 border-dashed border-foreground p-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Aucun tournoi configuré</h1>
          <p className="text-muted-foreground mb-6">
            Commencez par configurer votre tournoi pour voir les statistiques.
          </p>
          <Link to="/admin/tournament">
            <Button>Configurer le tournoi</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const hasAlerts = stats.alerts.almostFullTables.length > 0 || stats.alerts.emptyTables.length > 0

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-muted-foreground">{tournament.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Inscrits"
          value={stats.totalRegistrations}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Revenus"
          value={formatCurrency(stats.totalRevenue)}
          icon={<Euro className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          label="Taux de remplissage"
          value={`${stats.averageFillRate.toFixed(1)}%`}
          icon={<Percent className="w-5 h-5" />}
        />
        <StatCard
          label="Tableaux"
          value={stats.tablesCount}
          icon={<LayoutGrid className="w-5 h-5" />}
        />
      </div>

      {/* Alertes */}
      {hasAlerts && (
        <Card className="border-yellow-400 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.alerts.almostFullTables.length > 0 && (
              <div>
                <h4 className="font-bold text-sm mb-2">Tableaux presque complets ({'>'}80%)</h4>
                <div className="space-y-2">
                  {stats.alerts.almostFullTables.map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-3 bg-white border-2 border-foreground"
                    >
                      <div>
                        <span className="font-bold">{table.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {formatDate(table.date)} à {table.startTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-yellow-700">
                          {table.registeredCount}/{table.quota} inscrits
                        </span>
                        <Link to="/admin/tournament">
                          <Button size="sm" variant="outline">
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {stats.alerts.emptyTables.length > 0 && (
              <div>
                <h4 className="font-bold text-sm mb-2">Tableaux sans inscription</h4>
                <div className="space-y-2">
                  {stats.alerts.emptyTables.map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-3 bg-white border-2 border-foreground"
                    >
                      <div>
                        <span className="font-bold">{table.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {formatDate(table.date)} à {table.startTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">0/{table.quota} inscrits</span>
                        <Link to="/admin/tournament">
                          <Button size="sm" variant="outline">
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aperçu des tableaux */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Aperçu des tableaux
          </CardTitle>
          <Link to="/admin/tournament">
            <Button size="sm" variant="outline">
              Gérer les tableaux
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {tables && tables.length > 0 ? (
            <div className="space-y-3">
              {tables
                .slice()
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((table) => {
                  const fillRate = (table.registeredCount / table.quota) * 100
                  return (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-3 border-2 border-foreground bg-secondary/30"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-bold">{table.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(table.date)} à {table.startTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-bold">
                            {table.registeredCount}/{table.quota}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {fillRate.toFixed(0)}% rempli
                          </div>
                        </div>
                        <div className="w-24 h-3 bg-secondary border border-foreground overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              fillRate >= 100
                                ? 'bg-destructive'
                                : fillRate >= 80
                                  ? 'bg-yellow-500'
                                  : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(fillRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              {tables.length > 5 && (
                <div className="text-center pt-2">
                  <Link to="/admin/tournament" className="text-sm text-primary hover:underline">
                    Voir les {tables.length - 5} autres tableaux
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucun tableau configuré</p>
              <Link to="/admin/tournament" className="text-primary hover:underline">
                Ajouter un tableau
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/admin/tournament" className="block">
          <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <LayoutGrid className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-bold">Gérer les tableaux</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ajouter, modifier ou supprimer des tableaux
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/sponsors" className="block">
          <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-bold">Gérer les sponsors</h3>
              <p className="text-sm text-muted-foreground mt-1">Ajouter ou modifier les sponsors</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/tournament" className="block">
          <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-bold">Configurer le tournoi</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Modifier les informations générales
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
