import TournamentPlayer from '#models/tournament_player'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

/**
 * Service de gestion des numéros de dossard.
 *
 * Attribue automatiquement un numéro de dossard unique à chaque joueur
 * lors de sa première inscription à un tournoi. Le même numéro est conservé
 * pour toutes les inscriptions du joueur au même tournoi.
 */
class BibNumberService {
    /**
     * Récupère ou attribue un numéro de dossard pour un joueur dans un tournoi.
     *
     * Si le joueur a déjà un dossard pour ce tournoi, le retourne.
     * Sinon, attribue le prochain numéro disponible (max + 1).
     *
     * @param tournamentId - ID du tournoi
     * @param playerId - ID du joueur
     * @param trx - Transaction optionnelle pour garantir l'atomicité
     * @returns Le numéro de dossard attribué
     */
    async getOrAssignBibNumber(
        tournamentId: number,
        playerId: number,
        trx?: TransactionClientContract
    ): Promise<number> {
        // Si pas de transaction fournie, en créer une pour garantir l'atomicité
        if (!trx) {
            return db.transaction(async (innerTrx) => {
                return this.getOrAssignBibNumberInternal(tournamentId, playerId, innerTrx)
            })
        }

        return this.getOrAssignBibNumberInternal(tournamentId, playerId, trx)
    }

    /**
     * Logique interne d'attribution avec transaction garantie.
     */
    private async getOrAssignBibNumberInternal(
        tournamentId: number,
        playerId: number,
        trx: TransactionClientContract
    ): Promise<number> {
        // Chercher un dossard existant pour ce joueur/tournoi
        const existing = await TournamentPlayer.query({ client: trx })
            .where('tournament_id', tournamentId)
            .where('player_id', playerId)
            .first()

        if (existing) {
            return existing.bibNumber
        }

        return this.assignNewBibNumber(tournamentId, playerId, trx)
    }

    /**
     * Attribue un nouveau numéro de dossard de manière atomique.
     * Utilise un advisory lock PostgreSQL pour éviter les race conditions.
     */
    private async assignNewBibNumber(
        tournamentId: number,
        playerId: number,
        trx: TransactionClientContract
    ): Promise<number> {
        // Double-check au cas où (race condition protection)
        const existing = await TournamentPlayer.query({ client: trx })
            .where('tournament_id', tournamentId)
            .where('player_id', playerId)
            .first()

        if (existing) {
            return existing.bibNumber
        }

        // Acquérir un advisory lock basé sur le tournamentId pour sérialiser les assignations
        // Cela évite les doublons même en cas de requêtes concurrentes
        await trx.rawQuery('SELECT pg_advisory_xact_lock(?)', [tournamentId])

        // Trouver le prochain numéro disponible
        const maxResult = await TournamentPlayer.query({ client: trx })
            .where('tournament_id', tournamentId)
            .max('bib_number as maxBib')

        const nextBibNumber = (maxResult[0].$extras.maxBib || 0) + 1

        // Créer l'entrée tournament_player
        const tournamentPlayer = await TournamentPlayer.create(
            {
                tournamentId,
                playerId,
                bibNumber: nextBibNumber,
            },
            { client: trx }
        )

        return tournamentPlayer.bibNumber
    }

    /**
     n * Récupère le numéro de dossard d'un joueur pour un tournoi (sans attribution).
     *
     * @returns Le numéro de dossard ou null si le joueur n'est pas inscrit
     */
    async getBibNumber(tournamentId: number, playerId: number): Promise<number | null> {
        const tournamentPlayer = await TournamentPlayer.query()
            .where('tournament_id', tournamentId)
            .where('player_id', playerId)
            .first()

        return tournamentPlayer?.bibNumber ?? null
    }
}

const bibNumberService = new BibNumberService()
export default bibNumberService
