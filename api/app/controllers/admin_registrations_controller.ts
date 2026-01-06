import type { HttpContext } from '@adonisjs/core/http'
import Registration from '#models/registration'
import Table from '#models/table'
import Tournament from '#models/tournament'
import TournamentPlayer from '#models/tournament_player'
import User from '#models/user'
import Player from '#models/player'
import Payment from '#models/payment'
import { success, notFound, badRequest, error, created } from '#helpers/api_response'
import waitlistService from '#services/waitlist_service'
import registrationRulesService from '#services/registration_rules_service'
import helloAssoService from '#services/hello_asso_service'
import ffttService from '#services/fftt_service'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import {
  createAdminRegistrationValidator,
  generatePaymentLinkValidator,
} from '#validators/admin_registration'

interface RegistrationData {
  id: number
  status: string
  waitlistRank: number | null
  isAdminCreated: boolean
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
        isAdminCreated: reg.isAdminCreated ?? false,
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
        isAdminCreated: reg.isAdminCreated ?? false,
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

  /**
   * Create a new registration as admin.
   * POST /admin/registrations
   */
  async store(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(createAdminRegistrationValidator)

    // Search player via FFTT API by licence
    const ffttPlayer = await ffttService.searchByLicence(payload.licence)
    if (!ffttPlayer) {
      return notFound(ctx, 'Joueur non trouvé dans la base FFTT')
    }

    // Get or create player in local database
    const player = await Player.firstOrCreate(
      { licence: ffttPlayer.licence },
      {
        firstName: ffttPlayer.firstName,
        lastName: ffttPlayer.lastName,
        club: ffttPlayer.club,
        points: ffttPlayer.points,
        sex: ffttPlayer.sex,
        category: ffttPlayer.category,
        needsVerification: false,
        clast: ffttPlayer.clast ?? null,
        clglob: ffttPlayer.clglob ?? null,
      }
    )

    // Fetch tables
    const tables = await Table.query().whereIn('id', payload.tableIds)
    if (tables.length !== payload.tableIds.length) {
      return badRequest(ctx, 'One or more tables not found')
    }

    // Validate rules (unless bypassed)
    if (!payload.bypassRules) {
      const validation = await registrationRulesService.validateSelection(player, tables)
      if (!validation.valid) {
        return error(ctx, 'VALIDATION_ERROR', validation.errors.join(', '), 400)
      }
    }

    // Get or create system user for admin registrations
    const systemUser = await User.firstOrCreate(
      { email: 'system@tournament.local' },
      {
        fullName: 'Système',
        firstName: 'Système',
        lastName: 'Tournament',
        phone: null,
        password: null,
      }
    )

    // Calculate total amount (Number() needed because PostgreSQL decimal comes as string)
    const totalAmount = tables.reduce((sum, table) => sum + Number(table.price), 0)

    // Determine registration and payment status based on payment method
    const isOfflinePayment = ['cash', 'check', 'card'].includes(payload.paymentMethod)
    const isCollected = payload.collected === true

    let checkoutUrl: string | null = null
    let paymentStatus: 'pending' | 'succeeded' = 'pending'
    let registrationStatus: 'pending_payment' | 'paid' = 'pending_payment'

    if (isOfflinePayment && isCollected) {
      paymentStatus = 'succeeded'
      registrationStatus = 'paid'
    } else if (payload.paymentMethod === 'helloasso') {
      // Generate HelloAsso checkout
      const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:5173')

      const checkout = await helloAssoService.initCheckout({
        totalAmount: totalAmount * 100, // HelloAsso expects cents
        itemName: `Inscription admin - ${tables.map((t) => t.name).join(', ')}`,
        backUrl: `${frontendUrl}/admin/registrations`,
        returnUrl: `${frontendUrl}/admin/registrations?payment=success`,
        errorUrl: `${frontendUrl}/admin/registrations?payment=error`,
        payer: {
          firstName: player.firstName,
          lastName: player.lastName,
        },
        metadata: {
          admin_registration: 'true',
          player_id: String(player.id),
        },
      })

      checkoutUrl = checkout.redirectUrl

      // Create payment record
      const payment = await Payment.create({
        userId: systemUser.id,
        helloassoCheckoutIntentId: String(checkout.id),
        amount: Math.round(totalAmount * 100),
        status: 'pending',
        paymentMethod: 'helloasso',
      })

      // Create registrations and link to payment
      const registrations: Registration[] = []
      for (const table of tables) {
        const registration = await Registration.create({
          userId: systemUser.id,
          playerId: player.id,
          tableId: table.id,
          status: 'pending_payment',
          isAdminCreated: true,
        })
        registrations.push(registration)
      }

      // Link registrations to payment
      await payment.related('registrations').attach(registrations.map((r) => r.id))

      // Ensure player has a TournamentPlayer record for bib number
      const tournament = await Tournament.first()
      if (tournament) {
        await TournamentPlayer.firstOrCreate(
          { tournamentId: tournament.id, playerId: player.id },
          { tournamentId: tournament.id, playerId: player.id }
        )
      }

      return created(ctx, {
        message: 'Inscription créée avec lien de paiement HelloAsso',
        registrations: registrations.map((r) => ({
          id: r.id,
          status: r.status,
          tableId: r.tableId,
        })),
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
        },
        checkoutUrl,
      })
    }

    // Create payment record for offline payment
    const payment = await Payment.create({
      userId: systemUser.id,
      helloassoCheckoutIntentId: `admin-${Date.now()}`, // Unique ID for offline payments
      amount: Math.round(totalAmount * 100),
      status: paymentStatus,
      paymentMethod: payload.paymentMethod,
    })

    // Create registrations and link to payment
    const registrations: Registration[] = []
    for (const table of tables) {
      const registration = await Registration.create({
        userId: systemUser.id,
        playerId: player.id,
        tableId: table.id,
        status: registrationStatus,
        isAdminCreated: true,
      })
      registrations.push(registration)
    }

    // Link registrations to payment
    await payment.related('registrations').attach(registrations.map((r) => r.id))

    // Ensure player has a TournamentPlayer record for bib number
    const tournament = await Tournament.first()
    if (tournament) {
      await TournamentPlayer.firstOrCreate(
        { tournamentId: tournament.id, playerId: player.id },
        { tournamentId: tournament.id, playerId: player.id }
      )
    }

    return created(ctx, {
      message: isCollected ? 'Inscription créée et payée' : 'Inscription créée en attente de paiement',
      registrations: registrations.map((r) => ({
        id: r.id,
        status: r.status,
        tableId: r.tableId,
      })),
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
      },
    })
  }

  /**
   * Generate a HelloAsso payment link for an existing pending_payment registration.
   * POST /admin/registrations/:id/generate-payment-link
   */
  async generatePaymentLink(ctx: HttpContext) {
    const registrationId = Number(ctx.params.id)
    const payload = await ctx.request.validateUsing(generatePaymentLinkValidator)

    const registration = await Registration.query()
      .where('id', registrationId)
      .preload('player')
      .preload('table')
      .preload('payments')
      .first()

    if (!registration) {
      return notFound(ctx, 'Registration not found')
    }

    if (registration.status !== 'pending_payment') {
      return badRequest(ctx, `Cannot generate payment link for registration with status '${registration.status}'`)
    }

    // Get all registrations from the same payment
    const existingPayment = registration.payments[0]
    let relatedRegistrations: Registration[] = [registration]

    if (existingPayment) {
      await existingPayment.load('registrations', (query) => {
        query.preload('table')
      })
      relatedRegistrations = existingPayment.registrations
    }

    // Calculate total amount for all related registrations
    const totalAmount = relatedRegistrations.reduce((sum, r) => sum + r.table.price, 0)

    const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:5173')

    const checkout = await helloAssoService.initCheckout({
      totalAmount: totalAmount * 100, // HelloAsso expects cents
      itemName: `Inscription - ${relatedRegistrations.map((r) => r.table.name).join(', ')}`,
      backUrl: `${frontendUrl}/admin/registrations`,
      returnUrl: `${frontendUrl}/admin/registrations?payment=success`,
      errorUrl: `${frontendUrl}/admin/registrations?payment=error`,
      payer: {
        firstName: registration.player.firstName,
        lastName: registration.player.lastName,
        email: payload.email,
      },
      metadata: {
        admin_registration: 'true',
        player_id: String(registration.playerId),
        registration_id: String(registrationId),
      },
    })

    // Get system user
    const systemUser = await User.firstOrCreate(
      { email: 'system@tournament.local' },
      {
        fullName: 'Système',
        firstName: 'Système',
        lastName: 'Tournament',
        phone: null,
        password: null,
      }
    )

    // Create new payment record
    const payment = await Payment.create({
      userId: systemUser.id,
      helloassoCheckoutIntentId: String(checkout.id),
      amount: Math.round(totalAmount * 100),
      status: 'pending',
      paymentMethod: 'helloasso',
    })

    // Link all related registrations to new payment
    await payment.related('registrations').attach(relatedRegistrations.map((r) => r.id))

    return success(ctx, {
      checkoutUrl: checkout.redirectUrl,
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
      },
    })
  }
}
