export interface PlayerInfo {
    id: number
    licence: string
    firstName: string
    lastName: string
    club: string
    points: number
    sex: string | null
    category: string | null
    bibNumber: number | null
}

export interface TableInfo {
    id: number
    name: string
    date: string
    startTime: string
}

export interface SubscriberInfo {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
}

export interface PaymentInfo {
    id: number
    amount: number
    status: string
    createdAt: string
    helloassoOrderId: string | null
    payer?: {
        id: number
        firstName: string | null
        lastName: string | null
        email: string
    }
}

/** Informations sur l'admin qui a créé une inscription */
export interface CreatedByAdmin {
    id: number
    fullName: string
    email: string
}

/**
 * Représente un groupe d'inscriptions liées (même inscripteur, même paiement).
 * Permet de visualiser clairement quelle inscription (admin ou utilisateur)
 * correspond à quels tableaux et quel paiement.
 */
export interface RegistrationGroup {
    /** Identifiant unique du groupe (basé sur le premier registrationId) */
    groupId: string
    /** Si c'est une inscription créée par un admin */
    isAdminCreated: boolean
    /** L'admin qui a créé cette inscription (null si non tracé ou non admin) */
    createdByAdmin: CreatedByAdmin | null
    /** L'inscripteur de ce groupe */
    subscriber: SubscriberInfo
    /** Les tableaux de ce groupe avec leur statut */
    tables: (TableInfo & {
        registrationId: number
        status: string
        checkedInAt: string | null
        waitlistRank: number | null
    })[]
    /** Le paiement associé (peut être null si pas encore payé) */
    payment: PaymentInfo | null
    /** Date de création de la première inscription du groupe */
    createdAt: string
}

export interface RegistrationData {
    id: number
    status: string
    waitlistRank: number | null
    isAdminCreated: boolean
    checkedInAt: string | null
    createdAt: string
    createdByAdmin: CreatedByAdmin | null
    player: PlayerInfo
    table: TableInfo
    subscriber: SubscriberInfo
    payment: PaymentInfo | null
    payments: PaymentInfo[]
}

export interface AdminRegistrationsResponse {
    registrations: RegistrationData[]
    tournamentDays: string[]
}

export interface AggregatedPlayerRow {
    playerId: number
    bibNumber: number | null
    firstName: string
    lastName: string
    licence: string
    points: number
    club: string
    sex: string | null
    category: string | null
    tables: TableInfo[]
    registrationStatuses: Record<number, string>
    registrationWaitlistRanks: Record<number, number | null>
    registrationCheckedInAt: Record<number, string | null>
    hasAdminRegistration: boolean
    subscriber: SubscriberInfo
    payments: (PaymentInfo | null)[]
    registrationIds: number[]
    registrationIdByTableId: Record<number, number>
    createdAt: string
    /** Groupes d'inscriptions par inscripteur/paiement */
    registrationGroups: RegistrationGroup[]
}
