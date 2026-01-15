export type PresenceStatus = 'unknown' | 'present' | 'absent'

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
    presenceStatus: PresenceStatus
    checkedInAt: string | null
    tables: PlayerTable[]
}

export interface CheckinStats {
    total: number
    present: number
    absent: number
    unknown: number
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
    presenceStatus: PresenceStatus
    checkedInAt: string | null
}

export type PresenceFilter = 'all' | 'present' | 'absent' | 'unknown'
