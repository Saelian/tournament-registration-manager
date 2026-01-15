import type { HttpContext } from '@adonisjs/core/http'
import Sponsor from '#models/sponsor'
import Tournament from '#models/tournament'
import { createSponsorValidator, updateSponsorValidator } from '#validators/sponsor'
import { success, notFound, badRequest } from '#helpers/api_response'

export default class SponsorsController {
    /**
     * List all sponsors for the tournament
     */
    async index(ctx: HttpContext) {
        const tournament = await Tournament.first()
        if (!tournament) {
            return notFound(ctx, 'Tournament not configured')
        }

        const sponsors = await Sponsor.query()
            .where('tournament_id', tournament.id)
            .preload('tables')
            .orderBy('name', 'asc')

        return success(
            ctx,
            sponsors.map((s) => this.serialize(s))
        )
    }

    /**
     * Show a single sponsor
     */
    async show(ctx: HttpContext) {
        const { params } = ctx
        const sponsor = await Sponsor.query().where('id', params.id).preload('tables').first()
        if (!sponsor) {
            return notFound(ctx, 'Sponsor not found')
        }
        return success(ctx, this.serialize(sponsor))
    }

    /**
     * Create a new sponsor
     */
    async store(ctx: HttpContext) {
        const { request } = ctx
        const tournament = await Tournament.first()
        if (!tournament) {
            return badRequest(ctx, 'Tournament must be configured first')
        }

        const data = await request.validateUsing(createSponsorValidator)

        const sponsor = await Sponsor.create({
            tournamentId: tournament.id,
            name: data.name,
            websiteUrl: data.websiteUrl ?? null,
            contactEmail: data.contactEmail ?? null,
            description: data.description ?? null,
            isGlobal: data.isGlobal ?? false,
        })

        return success(ctx, this.serialize(sponsor), 201)
    }

    /**
     * Update a sponsor
     */
    async update(ctx: HttpContext) {
        const { params, request } = ctx
        const sponsor = await Sponsor.find(params.id)
        if (!sponsor) {
            return notFound(ctx, 'Sponsor not found')
        }

        const data = await request.validateUsing(updateSponsorValidator)

        if (data.name !== undefined) sponsor.name = data.name
        if (data.websiteUrl !== undefined) sponsor.websiteUrl = data.websiteUrl ?? null
        if (data.contactEmail !== undefined) sponsor.contactEmail = data.contactEmail ?? null
        if (data.description !== undefined) sponsor.description = data.description ?? null
        if (data.isGlobal !== undefined) sponsor.isGlobal = data.isGlobal

        await sponsor.save()

        return success(ctx, this.serialize(sponsor))
    }

    /**
     * Delete a sponsor
     */
    async destroy(ctx: HttpContext) {
        const { params } = ctx
        const sponsor = await Sponsor.find(params.id)
        if (!sponsor) {
            return notFound(ctx, 'Sponsor not found')
        }

        await sponsor.delete()
        return success(ctx, { message: 'Sponsor deleted' })
    }

    /**
     * List sponsors for a tournament (Public)
     */
    async byTournament(ctx: HttpContext) {
        const { params } = ctx
        const sponsors = await Sponsor.query()
            .where('tournament_id', params.tournamentId)
            .orderBy('is_global', 'desc')
            .orderBy('name', 'asc')

        return success(
            ctx,
            sponsors.map((s) => this.serializePublic(s))
        )
    }

    private serializePublic(sponsor: Sponsor) {
        return {
            id: sponsor.id,
            name: sponsor.name,
            websiteUrl: sponsor.websiteUrl,
            description: sponsor.description,
            isGlobal: sponsor.isGlobal,
        }
    }

    private serialize(sponsor: Sponsor) {
        return {
            id: sponsor.id,
            name: sponsor.name,
            websiteUrl: sponsor.websiteUrl,
            contactEmail: sponsor.contactEmail,
            description: sponsor.description,
            isGlobal: sponsor.isGlobal,
            tables: sponsor.tables?.map((t) => ({ id: t.id, name: t.name })) ?? [],
        }
    }
}
