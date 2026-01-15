import type { HttpContext } from '@adonisjs/core/http'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Player from '#models/player'
import Registration from '#models/registration'
import registrationRulesService from '#services/registration_rules_service'
import csvImportService from '#services/csv_import_service'
import { createTableValidator, updateTableValidator } from '#validators/table'
import { success, notFound, badRequest } from '#helpers/api_response'
import { DateTime } from 'luxon'
import type { GenderRestriction, FfttCategory } from '#constants/fftt'
import * as fs from 'node:fs/promises'

export default class TablesController {
    /**
     * List all tables
     */
    async index(ctx: HttpContext) {
        const tournament = await Tournament.first()
        if (!tournament) {
            return notFound(ctx, 'Tournament not configured')
        }

        const tables = await Table.query()
            .where('tournament_id', tournament.id)
            .preload('prizes')
            .preload('sponsors')
            .withCount('registrations', (query) => {
                query.whereIn('status', ['paid', 'pending_payment'])
            })
            .orderBy('date', 'asc')
            .orderBy('start_time', 'asc')

        // Get waitlist counts separately
        const waitlistCounts = await this.getWaitlistCounts(tables.map((t) => t.id))

        return success(
            ctx,
            tables.map((t) => this.serialize(t, waitlistCounts.get(t.id) || 0))
        )
    }

    /**
     * List tables with eligibility status for a specific player
     */
    async eligible(ctx: HttpContext) {
        const { request } = ctx
        const playerId = request.input('player_id')

        if (!playerId) {
            return badRequest(ctx, 'player_id is required')
        }

        const player = await Player.find(playerId)
        if (!player) {
            return notFound(ctx, 'Player not found')
        }

        const tournament = await Tournament.first()
        if (!tournament) {
            return notFound(ctx, 'Tournament not configured')
        }

        const tables = await Table.query()
            .where('tournament_id', tournament.id)
            .preload('prizes')
            .preload('sponsors')
            .withCount('registrations', (query) => {
                query.whereIn('status', ['paid', 'pending_payment'])
            })
            .orderBy('date', 'asc')
            .orderBy('start_time', 'asc')

        // Get waitlist counts separately
        const waitlistCounts = await this.getWaitlistCounts(tables.map((t) => t.id))

        const eligibilityResults = await registrationRulesService.getEligibleTables(player, tables)

        return success(
            ctx,
            eligibilityResults.map((r) => ({
                ...this.serialize(r.table, waitlistCounts.get(r.table.id) || 0),
                isEligible: r.isEligible,
                ineligibilityReasons: r.reasons,
            }))
        )
    }

    /**
     * List tables for a specific tournament (Public)
     */
    async byTournament(ctx: HttpContext) {
        const { params } = ctx
        const tables = await Table.query()
            .where('tournament_id', params.tournamentId)
            .preload('prizes')
            .preload('sponsors')
            .withCount('registrations', (query) => {
                query.whereIn('status', ['paid', 'pending_payment'])
            })
            .orderBy('date', 'asc')
            .orderBy('start_time', 'asc')

        // Get waitlist counts separately
        const waitlistCounts = await this.getWaitlistCounts(tables.map((t) => t.id))

        return success(
            ctx,
            tables.map((t) => this.serialize(t, waitlistCounts.get(t.id) || 0))
        )
    }

    /**
     * Show a single table
     */
    async show(ctx: HttpContext) {
        const { params } = ctx
        const table = await Table.query()
            .where('id', params.id)
            .preload('prizes')
            .preload('sponsors')
            .withCount('registrations', (query) => {
                query.whereIn('status', ['paid', 'pending_payment'])
            })
            .first()
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        // Get waitlist count separately
        const waitlistCounts = await this.getWaitlistCounts([table.id])

        return success(ctx, this.serialize(table, waitlistCounts.get(table.id) || 0))
    }

    /**
     * Create a new table
     */
    async store(ctx: HttpContext) {
        const { request } = ctx
        const tournament = await Tournament.first()
        if (!tournament) {
            return badRequest(ctx, 'Tournament must be configured first')
        }

        const data = await request.validateUsing(createTableValidator)

        if (data.pointsMax < data.pointsMin) {
            return badRequest(ctx, 'Points max must be greater than or equal to points min')
        }

        console.log('Creating table with data:', JSON.stringify(data, null, 2))

        const table = await Table.create({
            tournamentId: tournament.id,
            name: data.name,
            date: DateTime.fromJSDate(data.date),
            startTime: data.startTime,
            pointsMin: data.pointsMin,
            pointsMax: data.pointsMax,
            quota: data.quota,
            price: data.price,
            isSpecial: data.isSpecial ?? false,
            genderRestriction: (data.genderRestriction ?? null) as GenderRestriction,
            allowedCategories: (data.allowedCategories ?? null) as FfttCategory[] | null,
            maxCheckinTime: data.maxCheckinTime ?? null,
            nonNumberedOnly: data.nonNumberedOnly ?? false,
            referenceLetter: data.referenceLetter ?? null,
        })

        if (data.prizes && data.prizes.length > 0) {
            await table.related('prizes').createMany(data.prizes)
        }

        if (data.sponsorIds && data.sponsorIds.length > 0) {
            await table.related('sponsors').attach(data.sponsorIds)
        }

        // Reload relationships to return complete object
        await table.load('prizes')
        await table.load('sponsors')

        return success(ctx, this.serialize(table), 201)
    }

    /**
     * Update a table
     */
    async update(ctx: HttpContext) {
        const { params, request } = ctx
        const table = await Table.find(params.id)
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        const data = await request.validateUsing(updateTableValidator)

        // Validate minimum quota if changing
        if (data.quota !== undefined) {
            const confirmedCount = await Registration.query()
                .where('table_id', table.id)
                .whereIn('status', ['paid', 'pending_payment'])
                .count('* as total')
            const currentCount = Number(confirmedCount[0].$extras.total || 0)
            if (data.quota < currentCount) {
                return badRequest(
                    ctx,
                    `Impossible de réduire le quota à ${data.quota}. ${currentCount} joueur${currentCount > 1 ? 's sont' : ' est'} déjà inscrit${currentCount > 1 ? 's' : ''}.`
                )
            }
        }

        if (data.name) table.name = data.name
        if (data.date) table.date = DateTime.fromJSDate(data.date)
        if (data.startTime) table.startTime = data.startTime
        if (data.pointsMin !== undefined) table.pointsMin = data.pointsMin
        if (data.pointsMax !== undefined) table.pointsMax = data.pointsMax
        if (data.quota !== undefined) table.quota = data.quota
        if (data.price !== undefined) table.price = data.price
        if (data.isSpecial !== undefined) table.isSpecial = data.isSpecial
        if (data.genderRestriction !== undefined) table.genderRestriction = data.genderRestriction as GenderRestriction
        if (data.allowedCategories !== undefined)
            table.allowedCategories = data.allowedCategories as FfttCategory[] | null
        if (data.maxCheckinTime !== undefined) table.maxCheckinTime = data.maxCheckinTime
        if (data.nonNumberedOnly !== undefined) table.nonNumberedOnly = data.nonNumberedOnly
        if (data.referenceLetter !== undefined) table.referenceLetter = data.referenceLetter

        // Validate that pointsMax >= pointsMin after applying updates
        if (table.pointsMax < table.pointsMin) {
            return badRequest(ctx, 'Points max must be greater than or equal to points min')
        }

        await table.save()

        return success(ctx, this.serialize(table))
    }

    /**
     * Delete a table
     */
    async destroy(ctx: HttpContext) {
        const { params } = ctx
        const table = await Table.find(params.id)
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        await table.delete()
        return success(ctx, { message: 'Table deleted' })
    }

    /**
     * Preview CSV import - parse and validate without saving
     */
    async previewImport(ctx: HttpContext) {
        const file = ctx.request.file('file', {
            size: '2mb',
            extnames: ['csv'],
        })

        if (!file) {
            return badRequest(ctx, 'Fichier CSV requis')
        }

        if (!file.tmpPath) {
            return badRequest(ctx, 'Erreur lors du téléchargement du fichier')
        }

        const content = await fs.readFile(file.tmpPath, 'utf-8')
        const rows = csvImportService.parse(content)

        if (rows.length === 0) {
            return badRequest(ctx, 'Fichier CSV vide ou invalide')
        }

        const results = rows.map((row, index) => csvImportService.validateRow(row, index + 1))

        return success(ctx, {
            totalRows: results.length,
            validRows: results.filter((r) => r.isValid).length,
            invalidRows: results.filter((r) => !r.isValid).length,
            rows: results,
        })
    }

    /**
     * Confirm CSV import - create tables from validated data
     */
    async confirmImport(ctx: HttpContext) {
        const { request } = ctx
        const { rows } = request.body()

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return badRequest(ctx, 'Aucune donnée à importer')
        }

        const tournament = await Tournament.first()
        if (!tournament) {
            return badRequest(ctx, "Le tournoi doit être configuré avant d'importer des tableaux")
        }

        const created: { id: number; name: string }[] = []

        for (const rowData of rows) {
            const table = await Table.create({
                tournamentId: tournament.id,
                name: rowData.name,
                date: DateTime.fromISO(rowData.date),
                startTime: rowData.startTime,
                pointsMin: rowData.pointsMin,
                pointsMax: rowData.pointsMax,
                quota: rowData.quota,
                price: rowData.price,
                isSpecial: rowData.isSpecial ?? false,
                genderRestriction: (rowData.genderRestriction ?? null) as GenderRestriction,
                allowedCategories: (rowData.allowedCategories ?? null) as FfttCategory[] | null,
                maxCheckinTime: rowData.maxCheckinTime ?? null,
                nonNumberedOnly: rowData.nonNumberedOnly ?? false,
                referenceLetter: rowData.referenceLetter ?? null,
            })

            if (rowData.prizes && rowData.prizes.length > 0) {
                await table.related('prizes').createMany(rowData.prizes)
            }

            created.push({ id: table.id, name: table.name })
        }

        return success(ctx, { imported: created.length, tables: created })
    }

    /**
     * Download CSV template
     */
    async downloadTemplate(ctx: HttpContext) {
        const csv = csvImportService.generateTemplate()

        ctx.response.header('Content-Type', 'text/csv; charset=utf-8')
        ctx.response.header('Content-Disposition', 'attachment; filename="template_tableaux.csv"')
        ctx.response.send(csv)
    }

    private serialize(table: Table, waitlistCount: number = 0) {
        const prizes =
            table.prizes?.map((p) => ({
                id: p.id,
                rank: p.rank,
                prizeType: p.prizeType,
                cashAmount: p.cashAmount ? Number(p.cashAmount) : null,
                itemDescription: p.itemDescription,
            })) ?? []

        const sponsors =
            table.sponsors?.map((s) => ({
                id: s.id,
                name: s.name,
                websiteUrl: s.websiteUrl,
                isGlobal: s.isGlobal,
            })) ?? []

        const totalCashPrize = prizes
            .filter((p) => p.prizeType === 'cash' && p.cashAmount !== null)
            .reduce((sum, p) => sum + (p.cashAmount ?? 0), 0)

        return {
            id: table.id,
            name: table.name,
            referenceLetter: table.referenceLetter,
            date: table.date.toISODate(),
            startTime: table.startTime,
            pointsMin: table.pointsMin,
            pointsMax: table.pointsMax,
            quota: table.quota,
            price: Number(table.price),
            isSpecial: Boolean(table.isSpecial),
            genderRestriction: table.genderRestriction,
            allowedCategories: table.allowedCategories,
            maxCheckinTime: table.maxCheckinTime,
            nonNumberedOnly: Boolean(table.nonNumberedOnly),
            effectiveCheckinTime: this.calculateEffectiveCheckinTime(table),
            registeredCount: Number(table.$extras.registrations_count ?? 0),
            waitlistCount,
            prizes,
            sponsors,
            totalCashPrize,
        }
    }

    /**
     * Get waitlist counts for multiple tables in a single query.
     */
    private async getWaitlistCounts(tableIds: number[]): Promise<Map<number, number>> {
        if (tableIds.length === 0) {
            return new Map()
        }

        const results = await Registration.query()
            .whereIn('table_id', tableIds)
            .where('status', 'waitlist')
            .groupBy('table_id')
            .select('table_id')
            .count('* as count')

        const countMap = new Map<number, number>()
        for (const row of results) {
            countMap.set(row.tableId, Number(row.$extras.count))
        }
        return countMap
    }

    private calculateEffectiveCheckinTime(table: Table): string {
        if (table.maxCheckinTime) {
            return table.maxCheckinTime
        }
        // Default: 30 minutes before start time
        const [hours, minutes] = table.startTime.split(':').map(Number)
        const date = DateTime.fromObject({ hour: hours, minute: minutes })
        const checkinTime = date.minus({ minutes: 30 })
        return checkinTime.toFormat('HH:mm')
    }
}
