import type { HttpContext } from '@adonisjs/core/http'
import Table from '#models/table'
import Sponsor from '#models/sponsor'
import { syncTableSponsorsValidator } from '#validators/table_sponsors'
import { success, notFound } from '#helpers/api_response'

export default class TableSponsorsController {
    /**
     * Get sponsors for a table
     */
    async index(ctx: HttpContext) {
        const { params } = ctx
        const table = await Table.query().where('id', params.tableId).preload('sponsors').first()
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        return success(
            ctx,
            table.sponsors.map((s) => ({
                id: s.id,
                name: s.name,
                websiteUrl: s.websiteUrl,
                isGlobal: s.isGlobal,
            }))
        )
    }

    /**
     * Sync sponsors for a table (replace all associations)
     */
    async sync(ctx: HttpContext) {
        const { params, request } = ctx
        const table = await Table.find(params.tableId)
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        const data = await request.validateUsing(syncTableSponsorsValidator)

        // Verify all sponsors exist and belong to the same tournament
        if (data.sponsorIds.length > 0) {
            const sponsors = await Sponsor.query()
                .whereIn('id', data.sponsorIds)
                .where('tournament_id', table.tournamentId)

            if (sponsors.length !== data.sponsorIds.length) {
                return notFound(ctx, 'One or more sponsors not found')
            }
        }

        await table.related('sponsors').sync(data.sponsorIds)
        await table.load('sponsors')

        return success(
            ctx,
            table.sponsors.map((s) => ({
                id: s.id,
                name: s.name,
                websiteUrl: s.websiteUrl,
                isGlobal: s.isGlobal,
            }))
        )
    }

    /**
     * Add a sponsor to a table
     */
    async attach(ctx: HttpContext) {
        const { params } = ctx
        const table = await Table.find(params.tableId)
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        const sponsor = await Sponsor.query()
            .where('id', params.sponsorId)
            .where('tournament_id', table.tournamentId)
            .first()
        if (!sponsor) {
            return notFound(ctx, 'Sponsor not found')
        }

        await table.related('sponsors').attach([sponsor.id])
        await table.load('sponsors')

        return success(
            ctx,
            table.sponsors.map((s) => ({
                id: s.id,
                name: s.name,
                websiteUrl: s.websiteUrl,
                isGlobal: s.isGlobal,
            }))
        )
    }

    /**
     * Remove a sponsor from a table
     */
    async detach(ctx: HttpContext) {
        const { params } = ctx
        const table = await Table.find(params.tableId)
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        await table.related('sponsors').detach([params.sponsorId])
        await table.load('sponsors')

        return success(
            ctx,
            table.sponsors.map((s) => ({
                id: s.id,
                name: s.name,
                websiteUrl: s.websiteUrl,
                isGlobal: s.isGlobal,
            }))
        )
    }
}
