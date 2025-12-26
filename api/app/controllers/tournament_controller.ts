import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Tournament from '#models/tournament'
import { updateTournamentValidator } from '#validators/tournament'
import { success, notFound } from '#helpers/api_response'

export default class TournamentController {
  /**
   * List all tournaments
   */
  async index(ctx: HttpContext) {
    const tournaments = await Tournament.all()
    return success(ctx, tournaments.map((t) => this.serialize(t)))
  }

  /**
   * Get the tournament configuration
   */
  async show(ctx: HttpContext) {
    const tournament = await Tournament.first()

    if (!tournament) {
      return notFound(ctx, 'Tournament not configured')
    }

    return success(ctx, this.serialize(tournament))
  }

  /**
   * Create or update the tournament configuration
   */
  async update(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(updateTournamentValidator)

    let tournament = await Tournament.first()

    const tournamentData = {
      name: data.name,
      startDate: DateTime.fromJSDate(data.startDate),
      endDate: DateTime.fromJSDate(data.endDate),
      location: data.location,
      refundDeadline: data.refundDeadline ? DateTime.fromJSDate(data.refundDeadline) : null,
      waitlistTimerHours: data.waitlistTimerHours ?? Tournament.defaultWaitlistTimerHours,
    }

    if (tournament) {
      tournament.merge(tournamentData)
      await tournament.save()
    } else {
      tournament = await Tournament.create(tournamentData)
    }

    return success(ctx, this.serialize(tournament))
  }

  private serialize(tournament: Tournament) {
    return {
      id: tournament.id,
      name: tournament.name,
      startDate: tournament.startDate.toISODate(),
      endDate: tournament.endDate.toISODate(),
      location: tournament.location,
      refundDeadline: tournament.refundDeadline?.toISODate() ?? null,
      waitlistTimerHours: tournament.waitlistTimerHours,
    }
  }
}
