import { useMemo } from 'react'

/**
 * Configuration pour l'agrégation des joueurs.
 */
export interface AggregationConfig<TReg, TPlayer> {
    /** Filtrer les inscriptions par jour */
    dayFilter?: string
    /** Fonction pour extraire la date d'une inscription */
    getDate: (registration: TReg) => string
    /** Fonction d'agrégation des inscriptions en joueurs */
    aggregator: (registrations: TReg[]) => TPlayer[]
}

/**
 * Hook générique pour agréger les inscriptions par joueur.
 * Permet de réutiliser la logique d'agrégation entre les contextes admin et public.
 *
 * @param registrations Liste des inscriptions
 * @param config Configuration de l'agrégation
 * @returns Liste des joueurs agrégés
 */
export function useAggregatedPlayersGeneric<TReg, TPlayer>(
    registrations: TReg[] | undefined,
    config: AggregationConfig<TReg, TPlayer>
): TPlayer[] {
    const { dayFilter, getDate, aggregator } = config

    return useMemo(() => {
        if (!registrations) return []

        const filtered = dayFilter ? registrations.filter((r) => getDate(r) === dayFilter) : registrations

        return aggregator(filtered)
    }, [registrations, dayFilter, getDate, aggregator])
}
