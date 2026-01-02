import type { HttpContext } from '@adonisjs/core/http'
import Registration from '#models/registration'
import Table from '#models/table'
import TournamentPlayer from '#models/tournament_player'
import { success, notFound } from '#helpers/api_response'

interface RegistrationData {
  id: number
  status: string
  createdAt: string
  player: {
    id: number
    licence: string
    firstName: string
    lastName: string
    club: string
    points: number
    sex: string | null
    category: string | null
    bibNumber: number | null
  }
  table: {
    id: number
    name: string
    date: string
    startTime: string
  }
  subscriber: {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
  }
  payment: {
    id: number
    amount: number
    status: string
    createdAt: string
    helloassoOrderId: string | null
  } | null
}

export default class AdminRegistrationsController {
  /**
   * List all registrations with player, table, user and payment info.
   * GET /admin/registrations
   */
  async index(ctx: HttpContext) {
    const registrations = await Registration.query()
      .whereNot('status', 'cancelled')
      .preload('player')
      .preload('table')
      .preload('user')
      .preload('payments')
      .orderBy('created_at', 'desc')

    // Get all tournament player records to map bibNumbers
    const playerIds = [...new Set(registrations.map((r) => r.playerId))]
    const tournamentPlayers = await TournamentPlayer.query().whereIn('player_id', playerIds)
    const bibNumberMap = new Map<number, number>()
    for (const tp of tournamentPlayers) {
      bibNumberMap.set(tp.playerId, tp.bibNumber)
    }

    // Extract unique tournament days from tables
    const tournamentDays = [...new Set(registrations.map((r) => r.table.date.toISODate()!))].sort()

    // Format the response
    const formattedRegistrations: RegistrationData[] = registrations.map((reg) => {
      // Get the most recent successful payment for this registration
      const payment = reg.payments
        .filter((p) => p.status === 'succeeded')
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0]

      return {
        id: reg.id,
        status: reg.status,
        createdAt: reg.createdAt.toISO()!,
        player: {
          id: reg.player.id,
          licence: reg.player.licence,
          firstName: reg.player.firstName,
          lastName: reg.player.lastName,
          club: reg.player.club,
          points: reg.player.points,
          sex: reg.player.sex,
          category: reg.player.category,
          bibNumber: bibNumberMap.get(reg.player.id) ?? null,
        },
        table: {
          id: reg.table.id,
          name: reg.table.name,
          date: reg.table.date.toISODate()!,
          startTime: reg.table.startTime,
        },
        subscriber: {
          id: reg.user.id,
          firstName: reg.user.firstName,
          lastName: reg.user.lastName,
          email: reg.user.email,
          phone: reg.user.phone,
        },
        payment: payment
          ? {
              id: payment.id,
              amount: payment.amount,
              status: payment.status,
              createdAt: payment.createdAt.toISO()!,
              helloassoOrderId: payment.helloassoOrderId,
            }
          : null,
      }
    })

    return success(ctx, {
      registrations: formattedRegistrations,
      tournamentDays,
    })
  }

  /**
   * List registrations for a specific table.
   * GET /admin/tables/:id/registrations
   */
  async byTable(ctx: HttpContext) {
    const tableId = ctx.params.id

    const table = await Table.find(tableId)
    if (!table) {
      return notFound(ctx, 'Table not found')
    }

    const registrations = await Registration.query()
      .where('table_id', tableId)
      .whereNot('status', 'cancelled')
      .preload('player')
      .preload('table')
      .preload('user')
      .preload('payments')
      .orderBy('created_at', 'desc')

    // Get all tournament player records to map bibNumbers
    const playerIds = [...new Set(registrations.map((r) => r.playerId))]
    const tournamentPlayers = await TournamentPlayer.query().whereIn('player_id', playerIds)
    const bibNumberMap = new Map<number, number>()
    for (const tp of tournamentPlayers) {
      bibNumberMap.set(tp.playerId, tp.bibNumber)
    }

    // Format the response
    const formattedRegistrations: RegistrationData[] = registrations.map((reg) => {
      const payment = reg.payments
        .filter((p) => p.status === 'succeeded')
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0]

      return {
        id: reg.id,
        status: reg.status,
        createdAt: reg.createdAt.toISO()!,
        player: {
          id: reg.player.id,
          licence: reg.player.licence,
          firstName: reg.player.firstName,
          lastName: reg.player.lastName,
          club: reg.player.club,
          points: reg.player.points,
          sex: reg.player.sex,
          category: reg.player.category,
          bibNumber: bibNumberMap.get(reg.player.id) ?? null,
        },
        table: {
          id: reg.table.id,
          name: reg.table.name,
          date: reg.table.date.toISODate()!,
          startTime: reg.table.startTime,
        },
        subscriber: {
          id: reg.user.id,
          firstName: reg.user.firstName,
          lastName: reg.user.lastName,
          email: reg.user.email,
          phone: reg.user.phone,
        },
        payment: payment
          ? {
              id: payment.id,
              amount: payment.amount,
              status: payment.status,
              createdAt: payment.createdAt.toISO()!,
              helloassoOrderId: payment.helloassoOrderId,
            }
          : null,
      }
    })

    return success(ctx, {
      registrations: formattedRegistrations,
      table: {
        id: table.id,
        name: table.name,
        date: table.date.toISODate()!,
        startTime: table.startTime,
      },
    })
  }
}
