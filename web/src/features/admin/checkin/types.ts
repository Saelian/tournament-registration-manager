export interface PlayerTable {
  id: number
  name: string
  startTime: string
  registrationId: number
}

export interface CheckinPlayer {
  playerId: number
  firstName: string
  lastName: string
  licence: string
  club: string
  checkedInAt: string | null
  tables: PlayerTable[]
}

export interface CheckinStats {
  total: number
  present: number
  absent: number
}

export interface CheckinPlayersResponse {
  date: string
  players: CheckinPlayer[]
  stats: CheckinStats
}

export interface CheckinDaysResponse {
  days: string[]
}

export interface CheckinResponse {
  playerId: number
  playerName: string
  checkedInAt: string | null
}

export type PresenceFilter = 'all' | 'present' | 'absent'
