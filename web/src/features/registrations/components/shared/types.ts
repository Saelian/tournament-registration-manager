/**
 * Types partagés pour les composants d'affichage des joueurs.
 * Ces types permettent de configurer les composants PlayerTable et TableAccordion
 * pour les contextes admin et public.
 */

import type { ReactNode } from 'react'

/**
 * Type de base pour les informations de tableau.
 * Commun aux deux contextes.
 */
export interface BaseTableInfo {
    id: number
    name: string
    date: string
    startTime: string
}

/**
 * Type de base pour un joueur agrégé.
 * Les contextes admin et public étendent ce type.
 */
export interface BaseAggregatedPlayer {
    licence: string
    firstName: string
    lastName: string
    points: number
    club: string
    tables: BaseTableInfo[]
}

/**
 * Configuration d'une colonne pour PlayerTable.
 */
export interface PlayerTableColumn<T> {
    key: string
    header: string
    sortable?: boolean
    render?: (player: T) => ReactNode
    className?: string
    headerClassName?: string
}

/**
 * Props du composant PlayerTable.
 */
export interface PlayerTableProps<T extends BaseAggregatedPlayer> {
    /** Données des joueurs agrégés */
    data: T[]
    /** Fonction pour extraire la clé unique d'un joueur */
    keyExtractor: (player: T) => string | number
    /** Colonnes à afficher */
    columns: PlayerTableColumn<T>[]
    /** Afficher le filtre par jour */
    showDayFilter?: boolean
    /** Jours du tournoi disponibles */
    tournamentDays?: string[]
    /** Jour sélectionné (contrôlé) */
    selectedDay?: string
    /** Callback lors du changement de jour */
    onDayChange?: (day: string | undefined) => void
    /** Taille de page pour la pagination */
    pageSize?: number
    /** Rendu personnalisé pour la vue mobile */
    mobileCardRender?: (player: T) => ReactNode
    /** Callback lors du clic sur une ligne */
    onRowClick?: (player: T) => void
    /** Message si aucune donnée */
    emptyMessage?: string
    /** Clés de recherche */
    searchKeys?: string[]
    /** Filtres additionnels à afficher au-dessus du tableau */
    additionalFilters?: ReactNode
}

/**
 * Type pour les informations de tableau avec quota (pour l'accordion).
 */
export interface TableWithQuota extends BaseTableInfo {
    quota: number
    pointsMax: number
}

/**
 * Type pour les inscriptions groupées par tableau.
 */
export interface TableRegistrations<TReg> {
    confirmed: TReg[]
    waitlist: TReg[]
}

/**
 * Props du composant TableAccordion.
 */
export interface TableAccordionProps<TReg> {
    /** Toutes les inscriptions */
    registrations: TReg[]
    /** Liste des tableaux */
    tables: TableWithQuota[]
    /** Fonction pour regrouper les inscriptions par tableau */
    groupByTable: (registrations: TReg[], tables: TableWithQuota[]) => Record<number, TableRegistrations<TReg>>
    /** Rendu du tableau des joueurs confirmés */
    renderPlayerTable: (registrations: TReg[]) => ReactNode
    /** Rendu de la liste d'attente */
    renderWaitlist?: (waitlist: TReg[], tableName: string, quota: number, confirmedCount: number) => ReactNode
    /** Rendu des actions dans le header (ex: export CSV) */
    renderHeaderActions?: (tableId: number, tableName: string) => ReactNode
    /** Afficher le compteur de présence */
    showPresenceCount?: boolean
    /** Fonction pour vérifier si une inscription est pointée */
    isCheckedIn?: (registration: TReg) => boolean
}

/**
 * Props du composant WaitlistDisplay.
 */
export interface WaitlistDisplayProps<TReg> {
    /** Liste des inscriptions en attente */
    waitlist: TReg[]
    /** Nom du tableau */
    tableName: string
    /** Afficher les actions admin (promouvoir) */
    showAdminActions?: boolean
    /** Quota du tableau */
    quota?: number
    /** Nombre d'inscriptions confirmées */
    confirmedCount?: number
    /** Rendu d'une ligne de la liste d'attente */
    renderItem: (registration: TReg, index: number) => ReactNode
    /** Rendu des actions admin pour une inscription */
    renderAdminActions?: (registration: TReg) => ReactNode
}

/**
 * Props du composant MobilePlayerCard.
 */
export interface MobilePlayerCardProps<T extends BaseAggregatedPlayer> {
    /** Données du joueur */
    player: T
    /** Afficher la colonne tableaux */
    showTableColumn?: boolean
    /** Rendu personnalisé du contenu additionnel */
    renderAdditionalContent?: (player: T) => ReactNode
    /** Rendu personnalisé des badges de tableau */
    renderTableBadge?: (table: BaseTableInfo) => ReactNode
}
