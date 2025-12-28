import type { HttpContext } from '@adonisjs/core/http'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Player from '#models/player'
import registrationRulesService from '#services/registration_rules_service'
import { createTableValidator, updateTableValidator } from '#validators/table'
import { success, notFound, badRequest } from '#helpers/api_response'
import { DateTime } from 'luxon'

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
      .withCount('registrations', (query) => {
        query.whereIn('status', ['paid', 'pending_payment'])
      })
      .orderBy('date', 'asc')
      .orderBy('start_time', 'asc')

    return success(ctx, tables.map((t) => this.serialize(t)))
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
      .withCount('registrations', (query) => {
        query.whereIn('status', ['paid', 'pending_payment'])
      })
      .orderBy('date', 'asc')
      .orderBy('start_time', 'asc')

    const eligibilityResults = await registrationRulesService.getEligibleTables(player, tables)

    return success(ctx, eligibilityResults.map((r) => ({
      ...this.serialize(r.table),
      isEligible: r.isEligible,
      ineligibilityReasons: r.reasons
    })))
  }

  /**
   * List tables for a specific tournament (Public)
   */
  async byTournament(ctx: HttpContext) {
    const { params } = ctx
    const tables = await Table.query()
      .where('tournament_id', params.tournamentId)
      .withCount('registrations', (query) => {
        query.whereIn('status', ['paid', 'pending_payment'])
      })
      .orderBy('date', 'asc')
      .orderBy('start_time', 'asc')

    return success(ctx, tables.map((t) => this.serialize(t)))
  }

  /**
   * Show a single table
   */
  async show(ctx: HttpContext) {
    const { params } = ctx
    const table = await Table.query()
      .where('id', params.id)
      .withCount('registrations', (query) => {
        query.whereIn('status', ['paid', 'pending_payment'])
      })
      .first()
    if (!table) {
      return notFound(ctx, 'Table not found')
    }
    return success(ctx, this.serialize(table))
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
    })

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

    if (data.name) table.name = data.name
    if (data.date) table.date = DateTime.fromJSDate(data.date)
    if (data.startTime) table.startTime = data.startTime
    if (data.pointsMin !== undefined) table.pointsMin = data.pointsMin
    if (data.pointsMax !== undefined) table.pointsMax = data.pointsMax
    if (data.quota !== undefined) table.quota = data.quota
    if (data.price !== undefined) table.price = data.price
    if (data.isSpecial !== undefined) table.isSpecial = data.isSpecial

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

  private serialize(table: Table) {
    return {
      id: table.id,
      name: table.name,
      date: table.date.toISODate(),
      startTime: table.startTime,
      pointsMin: table.pointsMin,
      pointsMax: table.pointsMax,
      quota: table.quota,
      price: table.price,
      isSpecial: Boolean(table.isSpecial),
      registeredCount: Number(table.$extras.registrations_count ?? 0),
    }
  }
}
