import type { HttpContext } from '@adonisjs/core/http'
import Registration from '#models/registration'
import Table from '#models/table'
import Tournament from '#models/tournament'
import TournamentPlayer from '#models/tournament_player'
import { success, notFound, badRequest } from '#helpers/api_response'
import waitlistService from '#services/waitlist_service'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

interface RegistrationData {
  id: number
  status: string
  waitlistRank: number | null
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
        waitlistRank: reg.waitlistRank,
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
        waitlistRank: reg.waitlistRank,
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

  /**
   * Promote a waitlist registration to pending_payment status.
   * POST /admin/registrations/:id/promote
   */
  async promote(ctx: HttpContext) {
    const registrationId = Number(ctx.params.id)

    const registration = await Registration.query()
      .where('id', registrationId)
      .preload('player')
      .preload('table')
      .preload('user')
      .first()

    if (!registration) {
      return notFound(ctx, 'Registration not found')
    }

    if (registration.status !== 'waitlist') {
      return badRequest(ctx, `Cannot promote registration with status '${registration.status}'`)
    }

    // Get tournament for waitlist timer
    const tournament = await Tournament.first()
    if (!tournament) {
      return badRequest(ctx, 'Tournament not configured')
    }

    // Promote the registration
    await waitlistService.promoteToPayment(registrationId)

    // Send notification email to user
    const user = registration.user
    const table = registration.table
    const player = registration.player
    const timerHours = tournament.options.waitlistTimerHours || 4
    const dashboardUrl = env.get('FRONTEND_URL', 'http://localhost:5173') + '/dashboard'

    await mail.send((message) => {
      message
        .to(user.email)
        .from(env.get('ADMIN_EMAIL') || 'no-reply@tournament-app.com')
        .subject(`Une place s'est libérée - ${table.name}`).html(`
          <h1>Bonne nouvelle !</h1>
          <p>Une place s'est libérée sur le tableau <strong>${table.name}</strong> pour le joueur <strong>${player.firstName} ${player.lastName}</strong>.</p>
          <p>Vous avez été promu(e) depuis la liste d'attente et vous avez maintenant <strong>${timerHours} heures</strong> pour finaliser votre paiement.</p>
          <p><strong>Attention :</strong> Si vous ne payez pas dans ce délai, votre inscription sera automatiquement annulée.</p>
          <p>
            <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; font-weight: bold;">
              Accéder à mon tableau de bord
            </a>
          </p>
          <p>À bientôt sur les tables !</p>
        `)
    })

    // Reload registration to get updated data
    await registration.refresh()

    return success(ctx, {
      message: 'Registration promoted successfully',
      registration: {
        id: registration.id,
        status: registration.status,
        waitlistRank: registration.waitlistRank,
      },
    })
  }
}
