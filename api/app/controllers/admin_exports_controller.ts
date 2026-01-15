import type { HttpContext } from '@adonisjs/core/http'
import csvExportService, { type ExportColumn, type CsvSeparator } from '#services/csv_export_service'
import Table from '#models/table'
import Registration from '#models/registration'
import Payment from '#models/payment'
import TournamentPlayer from '#models/tournament_player'

/**
 * Configuration d'export reçue du frontend
 */
interface ExportRequest {
    columns: ExportColumn[]
    separator?: CsvSeparator
}

/**
 * Colonnes disponibles pour l'export des tableaux
 */
export const TABLES_EXPORT_COLUMNS: ExportColumn[] = [
    { key: 'referenceLetter', label: 'referenceLetter', included: true },
    { key: 'name', label: 'name', included: true },
    { key: 'date', label: 'date', included: true },
    { key: 'startTime', label: 'startTime', included: true },
    { key: 'pointsMin', label: 'pointsMin', included: true },
    { key: 'pointsMax', label: 'pointsMax', included: true },
    { key: 'quota', label: 'quota', included: true },
    { key: 'price', label: 'price', included: true },
    { key: 'isSpecial', label: 'isSpecial', included: true },
    { key: 'genderRestriction', label: 'genderRestriction', included: true },
    { key: 'allowedCategories', label: 'allowedCategories', included: true },
    { key: 'maxCheckinTime', label: 'maxCheckinTime', included: true },
    { key: 'nonNumberedOnly', label: 'nonNumberedOnly', included: true },
]

/**
 * Colonnes disponibles pour l'export des inscriptions
 */
export const REGISTRATIONS_EXPORT_COLUMNS: ExportColumn[] = [
    { key: 'bibNumber', label: 'bibNumber', included: true },
    { key: 'licence', label: 'licence', included: true },
    { key: 'lastName', label: 'lastName', included: true },
    { key: 'firstName', label: 'firstName', included: true },
    { key: 'points', label: 'points', included: true },
    { key: 'category', label: 'category', included: true },
    { key: 'club', label: 'club', included: true },
    { key: 'sex', label: 'sex', included: true },
    { key: 'tables', label: 'tables', included: true },
    { key: 'status', label: 'status', included: true },
    { key: 'presence', label: 'presence', included: false },
    { key: 'checkedInAt', label: 'checkedInAt', included: false },
    { key: 'createdAt', label: 'createdAt', included: true },
    { key: 'email', label: 'email', included: true },
    { key: 'phone', label: 'phone', included: true },
]

/**
 * Colonnes disponibles pour l'export des paiements
 */
export const PAYMENTS_EXPORT_COLUMNS: ExportColumn[] = [
    { key: 'createdAt', label: 'createdAt', included: true },
    { key: 'subscriberFirstName', label: 'subscriberFirstName', included: true },
    { key: 'subscriberLastName', label: 'subscriberLastName', included: true },
    { key: 'subscriberEmail', label: 'subscriberEmail', included: true },
    { key: 'amount', label: 'amount', included: true },
    { key: 'status', label: 'status', included: true },
    { key: 'refundMethod', label: 'refundMethod', included: true },
    { key: 'refundedAt', label: 'refundedAt', included: true },
    { key: 'players', label: 'players', included: true },
    { key: 'tables', label: 'tables', included: true },
]

export default class AdminExportsController {
    /**
     * Export des tableaux en CSV
     * POST /admin/exports/tables
     */
    async tables(ctx: HttpContext) {
        const body = ctx.request.body() as ExportRequest
        const { columns = TABLES_EXPORT_COLUMNS, separator = ';' } = body

        const tables = await Table.query().orderBy('date', 'asc').orderBy('start_time', 'asc')

        // Transformer les données pour l'export
        const data = tables.map((table) => ({
            referenceLetter: table.referenceLetter ?? '',
            name: table.name,
            date: table.date.toISODate(),
            startTime: table.startTime,
            pointsMin: table.pointsMin,
            pointsMax: table.pointsMax,
            quota: table.quota,
            price: table.price,
            isSpecial: table.isSpecial ? 'true' : 'false',
            genderRestriction: table.genderRestriction ?? '',
            allowedCategories: table.allowedCategories?.join('|') ?? '',
            maxCheckinTime: table.maxCheckinTime ?? '',
            nonNumberedOnly: table.nonNumberedOnly ? 'true' : 'false',
        }))

        const csvContent = csvExportService.generate(data, { columns, separator })
        const filename = csvExportService.generateFilename('tableaux')

        return this.sendCsvResponse(ctx, csvContent, filename)
    }

    /**
     * Export des inscriptions en CSV
     * POST /admin/exports/registrations
     */
    async registrations(ctx: HttpContext) {
        const body = ctx.request.body() as ExportRequest & {
            tableId?: number
            day?: string
            sortBy?: string
            sortOrder?: 'asc' | 'desc'
            presentOnly?: boolean
        }
        const {
            columns = REGISTRATIONS_EXPORT_COLUMNS,
            separator = ';',
            tableId,
            day,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            presentOnly = false,
        } = body

        // Construire la requête
        let query = Registration.query()
            .whereNot('status', 'cancelled')
            .preload('player')
            .preload('table')
            .preload('user')

        // Filtre par tableau
        if (tableId) {
            query = query.where('table_id', tableId)
        }

        // Filtre par jour
        if (day) {
            query = query.whereHas('table', (tableQuery) => {
                tableQuery.whereRaw('DATE(date) = ?', [day])
            })
        }

        // Filtre présents uniquement
        if (presentOnly) {
            query = query.whereNotNull('checked_in_at')
        }

        // Tri
        const sortColumn = this.mapSortColumn(sortBy)
        query = query.orderBy(sortColumn, sortOrder)

        const registrations = await query

        // Récupérer les numéros de dossard
        const playerIds = [...new Set(registrations.map((r) => r.playerId))]
        const tournamentPlayers = await TournamentPlayer.query().whereIn('player_id', playerIds)
        const bibNumberMap = new Map<number, number>()
        for (const tp of tournamentPlayers) {
            bibNumberMap.set(tp.playerId, tp.bibNumber)
        }

        // Regrouper par joueur pour les tableaux
        const playerRegistrations = new Map<
            number,
            {
                registration: (typeof registrations)[0]
                tables: string[]
            }
        >()

        for (const reg of registrations) {
            if (!playerRegistrations.has(reg.playerId)) {
                playerRegistrations.set(reg.playerId, {
                    registration: reg,
                    tables: [],
                })
            }
            playerRegistrations.get(reg.playerId)!.tables.push(reg.table.name)
        }

        // Transformer les données
        const data = Array.from(playerRegistrations.values()).map(({ registration, tables }) => {
            // Déterminer le libellé de présence selon le statut
            let presenceLabel: string
            switch (registration.presenceStatus) {
                case 'present':
                    presenceLabel = 'Présent'
                    break
                case 'absent':
                    presenceLabel = 'Absent'
                    break
                default:
                    presenceLabel = 'Inconnu'
            }

            return {
                bibNumber: bibNumberMap.get(registration.playerId) ?? '',
                licence: registration.player.licence,
                lastName: registration.player.lastName,
                firstName: registration.player.firstName,
                points: registration.player.points,
                category: registration.player.category ?? '',
                club: registration.player.club,
                sex: registration.player.sex ?? '',
                tables: tables.join(', '),
                status: registration.status,
                presence: presenceLabel,
                checkedInAt: registration.checkedInAt ? registration.checkedInAt.toFormat('HH:mm') : '',
                createdAt: registration.createdAt.toISO(),
                email: registration.user.email,
                phone: registration.user.phone ?? '',
            }
        })

        const csvContent = csvExportService.generate(data, { columns, separator })
        const filename = csvExportService.generateFilename('inscriptions')

        return this.sendCsvResponse(ctx, csvContent, filename)
    }

    /**
     * Export des paiements en CSV
     * POST /admin/exports/payments
     */
    async payments(ctx: HttpContext) {
        const body = ctx.request.body() as ExportRequest & {
            status?: string
            search?: string
        }
        const { columns = PAYMENTS_EXPORT_COLUMNS, separator = ';', status, search } = body

        // Construire la requête (même logique que AdminPaymentsController.index)
        let query = Payment.query()
            .preload('user')
            .preload('registrations', (regQuery) => {
                regQuery.preload('player').preload('table')
            })

        // Filtre par statut
        if (status) {
            query = query.where('status', status)
        }

        // Recherche par nom ou email
        if (search) {
            query = query.whereHas('user', (userQuery) => {
                userQuery
                    .whereILike('email', `%${search}%`)
                    .orWhereILike('first_name', `%${search}%`)
                    .orWhereILike('last_name', `%${search}%`)
            })
        }

        // Tri par défaut
        query = query.orderBy('created_at', 'desc')

        const payments = await query

        // Transformer les données
        const data = payments.map((payment) => {
            const playerNames = [
                ...new Set(payment.registrations.map((reg) => `${reg.player.lastName} ${reg.player.firstName}`)),
            ]
            const tableNames = [...new Set(payment.registrations.map((reg) => reg.table.name))]

            return {
                createdAt: payment.createdAt.toISO(),
                subscriberFirstName: payment.user.firstName ?? '',
                subscriberLastName: payment.user.lastName ?? '',
                subscriberEmail: payment.user.email,
                amount: payment.amount,
                status: payment.status,
                refundMethod: payment.refundMethod ?? '',
                refundedAt: payment.refundedAt?.toISO() ?? '',
                players: playerNames.join(', '),
                tables: tableNames.join(', '),
            }
        })

        const csvContent = csvExportService.generate(data, { columns, separator })
        const filename = csvExportService.generateFilename('paiements')

        return this.sendCsvResponse(ctx, csvContent, filename)
    }

    /**
     * Retourne les colonnes disponibles pour chaque type d'export
     * GET /admin/exports/columns
     */
    async columns(ctx: HttpContext) {
        return ctx.response.json({
            tables: TABLES_EXPORT_COLUMNS,
            registrations: REGISTRATIONS_EXPORT_COLUMNS,
            payments: PAYMENTS_EXPORT_COLUMNS,
        })
    }

    /**
     * Helper pour mapper les noms de colonnes frontend vers les colonnes DB
     */
    private mapSortColumn(sortBy: string): string {
        const mapping: Record<string, string> = {
            createdAt: 'created_at',
            bibNumber: 'player_id', // Approximation
            lastName: 'player_id', // Nécessite un join
        }
        return mapping[sortBy] ?? 'created_at'
    }

    /**
     * Helper pour envoyer la réponse CSV
     */
    private sendCsvResponse(ctx: HttpContext, content: string, filename: string) {
        ctx.response.header('Content-Type', 'text/csv; charset=utf-8')
        ctx.response.header('Content-Disposition', `attachment; filename="${filename}"`)
        return ctx.response.send(content)
    }
}
