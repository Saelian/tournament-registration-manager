import { useState, useMemo, useEffect } from 'react'
import { UserCheck, Loader2, Users, UserX, Check, X, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@components/ui/button'
import { SearchInput } from '@components/ui/search-input'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import { cn } from '../../../lib/utils'
import { useCheckinDays, useCheckinPlayers, useCheckin, useCancelCheckin } from './hooks'
import type { CheckinPlayer, PresenceFilter } from './types'
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

interface PlayerCardProps {
  player: CheckinPlayer
  onCheckin: (registrationId: number) => void
  onCancel: (registrationId: number) => void
  isLoading: boolean
}

function PlayerCard({ player, onCheckin, onCancel, isLoading }: PlayerCardProps) {
  const isPresent = player.checkedInAt !== null
  const firstRegistrationId = player.tables[0]?.registrationId

  return (
    <div
      className={cn(
        'p-4 border-2 border-foreground transition-all',
        isPresent ? 'bg-green-50 border-green-600' : 'bg-card hover:bg-secondary/30'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg truncate">
              {player.lastName.toUpperCase()} {player.firstName}
            </h3>
            {isPresent && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-green-200 text-green-900 border border-green-600">
                <Check className="w-3 h-3 mr-1" />
                {player.checkedInAt}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-mono">{player.licence}</p>
          <p className="text-sm text-muted-foreground truncate">{player.club}</p>

          {/* Tables */}
          <div className="mt-2 flex flex-wrap gap-1">
            {player.tables.map((table) => (
              <span
                key={table.id}
                className={cn(
                  'inline-flex items-center px-2 py-1 text-xs font-medium border',
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

        {/* Action button */}
        <Button
          size="lg"
          variant={isPresent ? 'outline' : 'default'}
          className={cn(
            'h-16 w-16 p-0 shrink-0',
            isPresent && 'border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700'
          )}
          onClick={() => {
            if (isPresent) {
              onCancel(firstRegistrationId)
            } else {
              onCheckin(firstRegistrationId)
            }
          }}
          disabled={isLoading || !firstRegistrationId}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isPresent ? (
            <X className="h-8 w-8" />
          ) : (
            <Check className="h-8 w-8" />
          )}
        </Button>
      </div>
    </div>
  )
}

export function CheckinPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [presenceFilter, setPresenceFilter] = useState<PresenceFilter>('all')
  const [loadingPlayerId, setLoadingPlayerId] = useState<number | null>(null)

  const { data: daysData, isLoading: daysLoading } = useCheckinDays()
  const { data: playersData, isLoading: playersLoading } = useCheckinPlayers(selectedDate)

  const checkinMutation = useCheckin()
  const cancelMutation = useCancelCheckin()

  // Auto-select today or first day
  useEffect(() => {
    if (daysData?.days && daysData.days.length > 0 && !selectedDate) {
      const today = daysData.days.find(isToday)
      setSelectedDate(today ?? daysData.days[0])
    }
  }, [daysData, selectedDate])

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
    if (presenceFilter === 'present') {
      players = players.filter((p) => p.checkedInAt !== null)
    } else if (presenceFilter === 'absent') {
      players = players.filter((p) => p.checkedInAt === null)
    }

    return players
  }, [playersData?.players, search, presenceFilter])

  const handleCheckin = async (registrationId: number) => {
    const player = playersData?.players.find((p) =>
      p.tables.some((t) => t.registrationId === registrationId)
    )
    if (player) {
      setLoadingPlayerId(player.playerId)
    }

    checkinMutation.mutate(registrationId, {
      onSuccess: (data) => {
        toast.success(`${data.playerName} pointé à ${data.checkedInAt}`)
        setLoadingPlayerId(null)
      },
      onError: (error) => {
        toast.error(`Erreur: ${error.message}`)
        setLoadingPlayerId(null)
      },
    })
  }

  const handleCancel = async (registrationId: number) => {
    const player = playersData?.players.find((p) =>
      p.tables.some((t) => t.registrationId === registrationId)
    )
    if (player) {
      setLoadingPlayerId(player.playerId)
    }

    cancelMutation.mutate(registrationId, {
      onSuccess: (data) => {
        toast.success(`Pointage annulé pour ${data.playerName}`)
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
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
          <UserCheck className="h-8 w-8" />
          Pointage
        </h1>
        <div className="bg-secondary border-2 border-dashed border-foreground p-8 text-center">
          <p className="font-bold text-muted-foreground">Aucun jour de tournoi configuré</p>
          <p className="text-sm text-muted-foreground mt-2">
            Créez des tableaux avec des dates pour activer le pointage
          </p>
        </div>
      </div>
    )
  }

  const stats = playersData?.stats ?? { total: 0, present: 0, absent: 0 }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserCheck className="h-8 w-8" />
          Pointage
        </h1>
        <p className="text-muted-foreground mt-2">
          Pointez les joueurs présents le jour du tournoi
        </p>
      </div>

      {/* Day selector */}
      <div className="mb-6 overflow-x-auto">
        <Tabs value={selectedDate ?? ''} onValueChange={setSelectedDate}>
          <TabsList className="inline-flex w-auto">
            {days.map((day) => (
              <TabsTrigger
                key={day}
                value={day}
                className={cn(
                  'whitespace-nowrap',
                  isToday(day) && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                {formatDate(day)}
                {isToday(day) && " (Aujourd'hui)"}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border-2 border-foreground p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-600 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Présents</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.present}</p>
        </div>
        <div className="bg-red-50 border-2 border-red-600 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Absents</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.absent}</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="sticky top-0 z-10 py-3 mb-4 space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher par nom, licence ou club..."
          className="w-full"
        />
        <div className="flex gap-2">
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
            className={presenceFilter === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            Absents ({stats.absent})
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
              onCancel={handleCancel}
              isLoading={loadingPlayerId === player.playerId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
