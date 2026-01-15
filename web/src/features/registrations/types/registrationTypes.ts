export interface Player {
    id?: number
    licence: string
    firstName: string
    lastName: string
    club: string
    points: number
    sex: string | null
    category: string | null
    needsVerification?: boolean
}

export interface PlayerSearchError {
    message: string
    allowManualEntry?: boolean
}

export interface Registration {
    id: number
    userId: number
    playerId: number
    tableId: number
    status: 'pending_payment' | 'paid' | 'waitlist' | 'cancelled'
    waitlistRank: number | null
    bibNumber?: number | null
    createdAt: string
    updatedAt: string
    table?: {
        id: number
        name: string
        date: string
        startTime: string
        price: number
    }
    player?: Player
}

export interface CreateRegistrationsResponse {
    message: string
    registrations: Registration[]
    bibNumber?: number
    redirectUrl?: string
    paymentId?: number
    paymentError?: boolean
}
