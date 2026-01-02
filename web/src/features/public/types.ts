/**
 * Types pour les listes publiques de joueurs inscrits.
 * Ces types ne contiennent PAS de données sensibles (email, téléphone, dossard, paiement).
 */

export interface PublicPlayerInfo {
    licence: string
    firstName: string
    lastName: string
    points: number
    category: string | null
    club: string
}

export interface PublicTableInfo {
    id: number
    name: string
    date: string
    startTime: string
}

export interface PublicTableWithCount extends PublicTableInfo {
    registrationCount: number
}

export interface PublicRegistrationData {
    player: PublicPlayerInfo
    table: PublicTableInfo
}

export interface PublicRegistrationsResponse {
    registrations: PublicRegistrationData[]
    tournamentDays: string[]
    tables: PublicTableWithCount[]
    totalPlayers: number
}

/**
 * Joueur agrégé pour l'affichage dans le tableau.
 * Un joueur peut être inscrit à plusieurs tableaux.
 */
export interface AggregatedPublicPlayer {
    licence: string
    firstName: string
    lastName: string
    points: number
    category: string | null
    club: string
    tables: PublicTableInfo[]
}
