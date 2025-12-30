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
    return success(
      ctx,
      tournaments.map((t) => this.serialize(t))
    )
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

    const options = {
      refundDeadline: data.options?.refundDeadline ?? null,
      waitlistTimerHours:
        data.options?.waitlistTimerHours ?? Tournament.defaultOptions.waitlistTimerHours,
    }

    const tournamentData = {
      name: data.name,
      startDate: DateTime.fromJSDate(data.startDate),
      endDate: DateTime.fromJSDate(data.endDate),
      location: data.location,
      options,
      shortDescription: data.shortDescription ?? null,
      longDescription: data.longDescription ?? null,
      rulesLink: data.rulesLink ?? null,
      rulesContent: data.rulesContent ?? null,
      ffttHomologationLink: data.ffttHomologationLink ?? null,
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
      options: tournament.options,
      shortDescription: tournament.shortDescription,
      longDescription: tournament.longDescription,
      rulesLink: tournament.rulesLink,
      rulesContent: tournament.rulesContent,
      ffttHomologationLink: tournament.ffttHomologationLink,
    }
  }
}
