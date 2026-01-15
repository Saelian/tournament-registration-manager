export interface Tournament {
    id: number
    name: string
    location: string
    startDate: string
    endDate: string
}

export interface Table {
    id: number
    name: string
    date: string
    startTime: string
    pointsMin: number
    pointsMax: number
    price: number
    tournament: Tournament
}

export interface Player {
    id: number
    firstName: string
    lastName: string
    licence: string
    club: string
    points: number
}

export type RegistrationStatus = 'pending_payment' | 'paid' | 'waitlist' | 'cancelled'

export interface Registration {
    id: number
    status: RegistrationStatus
    waitlistRank: number | null
    waitlistTotal?: number | null
    bibNumber?: number | null
    createdAt: string
    table: Table
    player: Player
}
