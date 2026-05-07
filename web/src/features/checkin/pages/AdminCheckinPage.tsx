import { useState, useMemo } from 'react'
import { PageHeader } from '@components/ui/page-header'
import { UserCheck, Loader2, Users, UserX, Check, X, Clock, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@components/ui/button'
import { SearchInput } from '@components/ui/search-input'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import { cn } from '@/lib/utils'
import { useCheckinDays, useCheckinPlayers, useCheckin, useMarkAbsent, useCancelCheckin } from '../hooks'
import type { CheckinPlayer, PresenceFilter, PresenceStatus } from '../types'
import { formatLocalTime } from '@lib/formatters'
import { formatTime } from '@/lib/formatters'

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const isToday = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

const isTableApproaching = (startTime: string) => {
  const now = new Date()
  const [hours, minutes] = startTime.split(':').map(Number)
  const tableTime = new Date()
  tableTime.setHours(hours, minutes, 0, 0)

  const diffMinutes = (tableTime.getTime() - now.getTime()) / (1000 * 60)
  return diffMinutes > 0 && diffMinutes <= 30
}

interface TableSummary {
  id: number
  name: string
  startTime: string
  total: number
  present: number
  absent: number
}

function TablesSummaryBar({ players }: { players: CheckinPlayer[] }) {
  const tables = useMemo(() => {
    const map = new Map<number, TableSummary>()
    for (const player of players) {
      for (const table of player.tables) {
        if (!map.has(table.id)) {
          map.set(table.id, { id: table.id, name: table.name, startTime: table.startTime, total: 0, present: 0, absent: 0 })
        }
        const entry = map.get(table.id)!
        entry.total++
        if (player.presenceStatus === 'present') entry.present++
        else if (player.presenceStatus === 'absent') entry.absent++
      }
    }
    return Array.from(map.values()).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [players])

  if (tables.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tables.map((table) => {
        const allPresent = table.present === table.total && table.total > 0
        const somePresent = table.present > 0
        return (
          <div
            key={table.id}
            className={cn(
              'inline-flex flex-col px-3 py-2 neo-brutal-sm min-w-[90px]',
              allPresent
                ? 'bg-green-50 border-green-600'
                : 'bg-card border-foreground/30'
            )}
          >
            <span className="text-xs text-muted-foreground tabular-nums">{formatTime(table.startTime)}</span>
            <span className="font-bold text-sm">{table.name}</span>
            <span
              className={cn(
                'text-lg font-black tabular-nums leading-tight',
                allPresent ? 'text-green-700' : somePresent ? 'text-amber-700' : 'text-foreground/40'
              )}
            >
              {table.present}<span className="text-sm font-medium text-muted-foreground">/{table.total}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface PlayerCardProps {
  player: CheckinPlayer
  onCheckin: (registrationId: number) => void
  onMarkAbsent: (registrationId: number) => void
  onCancel: (registrationId: number) => void
  isLoading: boolean
}

function PlayerCard({ player, onCheckin, onMarkAbsent, onCancel, isLoading }: PlayerCardProps) {
  const status = player.presenceStatus
  const firstRegistrationId = player.tables[0]?.registrationId

  // Déterminer les styles selon le statut
  const getCardStyles = (status: PresenceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 border-green-600'
      case 'absent':
        return 'bg-orange-50 border-orange-600'
      default:
        return 'bg-card hover:bg-secondary/30'
    }
  }

  const getStatusBadge = (status: PresenceStatus, checkedInAt: string | null) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-green-200 text-green-900 border border-green-600">
            <Check className="w-3 h-3 mr-1" />
            {checkedInAt ? formatLocalTime(checkedInAt) : 'Présent'}
          </span>
        )
      case 'absent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-orange-200 text-orange-900 border border-orange-600">
            <X className="w-3 h-3 mr-1" />
            Absent
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('px-3 py-2 border-2 border-foreground transition-all', getCardStyles(status))}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-bold text-base truncate">
              {player.lastName.toUpperCase()} {player.firstName}
            </h3>
            <span className="text-xs text-muted-foreground font-mono">{player.licence}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground truncate">{player.club}</span>
            {getStatusBadge(status, player.checkedInAt)}
          </div>

          {/* Tables */}
          <div className="mt-1 flex flex-wrap gap-1">
            {player.tables.map((table) => (
              <span
                key={table.id}
                className={cn(
                  'inline-flex items-center px-2 py-0.5 text-xs font-medium border',
                  isTableApproaching(table.startTime)
                    ? 'bg-orange-100 border-orange-500 text-orange-800 animate-pulse'
                    : 'bg-secondary border-foreground/30'
                )}
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(table.startTime)} - {table.name}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-row gap-2 shrink-0 items-center">
          {status === 'unknown' && (
            <>
              <Button
                size="lg"
                variant="default"
                className="h-12 w-12 p-0 bg-green-600 hover:bg-green-700"
                onClick={() => onCheckin(firstRegistrationId)}
                disabled={isLoading || !firstRegistrationId}
                title="Marquer présent"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-6 w-6" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-12 p-0 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                onClick={() => onMarkAbsent(firstRegistrationId)}
                disabled={isLoading || !firstRegistrationId}
                title="Marquer absent"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-6 w-6" />}
              </Button>
            </>
          )}
          {(status === 'present' || status === 'absent') && (
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-12 p-0 border-gray-400 text-gray-600 hover:bg-gray-100"
              onClick={() => onCancel(firstRegistrationId)}
              disabled={isLoading || !firstRegistrationId}
              title="Annuler le statut"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <HelpCircle className="h-6 w-6" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminCheckinPage() {
  const [manuallySelectedDate, setManuallySelectedDate] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [presenceFilter, setPresenceFilter] = useState<PresenceFilter>('all')
  const [loadingPlayerId, setLoadingPlayerId] = useState<number | null>(null)

  const { data: daysData, isLoading: daysLoading } = useCheckinDays()

  // Auto-select today or first day
  const defaultDate = useMemo(() => {
    if (!daysData?.days || daysData.days.length === 0) return null
    const today = daysData.days.find(isToday)
    return today ?? daysData.days[0]
  }, [daysData])

  const selectedDate = manuallySelectedDate ?? defaultDate

  const { data: playersData, isLoading: playersLoading } = useCheckinPlayers(selectedDate)

  const checkinMutation = useCheckin()
  const markAbsentMutation = useMarkAbsent()
  const cancelMutation = useCancelCheckin()

  // Filter players
  const filteredPlayers = useMemo(() => {
    if (!playersData?.players) return []

    let players = playersData.players

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      players = players.filter(
        (p) =>
          p.lastName.toLowerCase().includes(searchLower) ||
          p.firstName.toLowerCase().includes(searchLower) ||
          p.licence.toLowerCase().includes(searchLower) ||
          p.club.toLowerCase().includes(searchLower)
      )
    }

    // Presence filter
    if (presenceFilter !== 'all') {
      players = players.filter((p) => p.presenceStatus === presenceFilter)
    }

    return players
  }, [playersData?.players, search, presenceFilter])

  const handleCheckin = async (registrationId: number) => {
    const player = playersData?.players.find((p) => p.tables.some((t) => t.registrationId === registrationId))
    if (player) {
      setLoadingPlayerId(player.playerId)
    }

    checkinMutation.mutate(registrationId, {
      onSuccess: (data) => {
        toast.success(`${data.playerName} pointé à ${data.checkedInAt ? formatLocalTime(data.checkedInAt) : ''}`)
        setLoadingPlayerId(null)
      },
      onError: (error) => {
        toast.error(`Erreur: ${error.message}`)
        setLoadingPlayerId(null)
      },
    })
  }

  const handleMarkAbsent = async (registrationId: number) => {
    const player = playersData?.players.find((p) => p.tables.some((t) => t.registrationId === registrationId))
    if (player) {
      setLoadingPlayerId(player.playerId)
    }

    markAbsentMutation.mutate(registrationId, {
      onSuccess: (data) => {
        toast.success(`${data.playerName} marqué absent`)
        setLoadingPlayerId(null)
      },
      onError: (error) => {
        toast.error(`Erreur: ${error.message}`)
        setLoadingPlayerId(null)
      },
    })
  }

  const handleCancel = async (registrationId: number) => {
    const player = playersData?.players.find((p) => p.tables.some((t) => t.registrationId === registrationId))
    if (player) {
      setLoadingPlayerId(player.playerId)
    }

    cancelMutation.mutate(registrationId, {
      onSuccess: (data) => {
        toast.success(`Statut réinitialisé pour ${data.playerName}`)
        setLoadingPlayerId(null)
      },
      onError: (error) => {
        toast.error(`Erreur: ${error.message}`)
        setLoadingPlayerId(null)
      },
    })
  }

  if (daysLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const days = daysData?.days ?? []

  if (days.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader title="Pointage" icon={UserCheck} className="mb-8" />
        <div className="bg-secondary border-2 border-dashed border-foreground p-8 text-center">
          <p className="font-bold text-muted-foreground">Aucun jour de tournoi configuré</p>
          <p className="text-sm text-muted-foreground mt-2">
            Créez des tableaux avec des dates pour activer le pointage
          </p>
        </div>
      </div>
    )
  }

  const stats = playersData?.stats ?? { total: 0, present: 0, absent: 0, unknown: 0 }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader
        title="Pointage"
        description="Pointez les joueurs présents le jour du tournoi"
        icon={UserCheck}
        className="mb-6"
      />

      {/* Day selector */}
      <div className="mb-6 overflow-x-auto">
        <Tabs value={selectedDate ?? ''} onValueChange={setManuallySelectedDate}>
          <TabsList className="inline-flex w-auto">
            {days.map((day) => (
              <TabsTrigger
                key={day}
                value={day}
                className={cn('whitespace-nowrap', isToday(day) && 'ring-2 ring-primary ring-offset-2')}
              >
                {formatDate(day)}
                {isToday(day) && " (Aujourd'hui)"}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card p-3 neo-brutal-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-600 p-3 shadow-[2px_2px_0px_0px] shadow-foreground">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Présents</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.present}</p>
        </div>
        <div className="bg-orange-50 border-2 border-orange-600 p-3 shadow-[2px_2px_0px_0px] shadow-foreground">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Absents</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{stats.absent}</p>
        </div>
        <div className="bg-gray-50 border-2 border-gray-400 p-3 shadow-[2px_2px_0px_0px] shadow-foreground">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Inconnus</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.unknown}</p>
        </div>
      </div>

      {/* Tables summary */}
      {playersData && <TablesSummaryBar players={playersData.players} />}

      {/* Search and filters */}
      <div className="sticky top-0 z-10 py-3 mb-4 space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher par nom, licence ou club..."
          className="w-full"
        />
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={presenceFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setPresenceFilter('all')}
          >
            Tous ({stats.total})
          </Button>
          <Button
            size="sm"
            variant={presenceFilter === 'present' ? 'default' : 'outline'}
            onClick={() => setPresenceFilter('present')}
            className={presenceFilter === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Présents ({stats.present})
          </Button>
          <Button
            size="sm"
            variant={presenceFilter === 'absent' ? 'default' : 'outline'}
            onClick={() => setPresenceFilter('absent')}
            className={presenceFilter === 'absent' ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            Absents ({stats.absent})
          </Button>
          <Button
            size="sm"
            variant={presenceFilter === 'unknown' ? 'default' : 'outline'}
            onClick={() => setPresenceFilter('unknown')}
            className={presenceFilter === 'unknown' ? 'bg-gray-600 hover:bg-gray-700' : ''}
          >
            Inconnus ({stats.unknown})
          </Button>
        </div>
      </div>

      {/* Player list */}
      {playersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="bg-secondary border-2 border-dashed border-foreground p-8 text-center">
          <p className="font-bold text-muted-foreground">
            {search ? 'Aucun joueur trouvé' : 'Aucun joueur inscrit pour ce jour'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.playerId}
              player={player}
              onCheckin={handleCheckin}
              onMarkAbsent={handleMarkAbsent}
              onCancel={handleCancel}
              isLoading={loadingPlayerId === player.playerId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
