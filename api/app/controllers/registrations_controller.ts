import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import Registration from '#models/registration'
import Payment from '#models/payment'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import registrationRulesService from '#services/registration_rules_service'
import registrationPeriodService from '#services/registration_period_service'
import cancellationService from '#services/cancellation_service'
import bibNumberService from '#services/bib_number_service'
import waitlistService from '#services/waitlist_service'
import helloAssoService from '#services/hello_asso_service'
import { generatePaymentReference } from '#helpers/payment_reference'
import helloAssoConfig from '#config/helloasso'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import { DateTime } from 'luxon'

export default class RegistrationsController {
  /**
   * Create registrations for selected tables.
   * Handles saturation: if table is full, adds to waitlist with calculated rank.
   * If initiatePayment is true, also creates a HelloAsso checkout for pending_payment registrations.
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { playerId, tableIds, initiatePayment } = request.all()

    // Vérifier que la période d'inscription est ouverte
    const tournament = await Tournament.first()
    if (!tournament) {
      return response.notFound({ message: 'Aucun tournoi configuré' })
    }

    const periodInfo = registrationPeriodService.getRegistrationPeriodInfo(tournament)
    if (!periodInfo.isOpen) {
      return response.badRequest({
        status: 'error',
        code: registrationPeriodService.getErrorCode(periodInfo.status),
        message: periodInfo.message,
      })
    }

    if (!playerId || !tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
      return response.badRequest({
        message: 'Invalid payload: playerId and tableIds (non-empty array) are required',
      })
    }

    const player = await Player.find(playerId)
    if (!player) {
      return response.notFound({ message: 'Player not found' })
    }

    if (player.userId !== user.id) {
      return response.forbidden({
        message: 'Cannot create registration for a player not linked to your account',
      })
    }

    // Load tables with registrations count for waitlist protection check
    const tables = await Table.query()
      .whereIn('id', tableIds)
      .withCount('registrations', (query) => {
        query.whereIn('status', ['paid', 'pending_payment'])
      })
    if (tables.length !== tableIds.length) {
      return response.badRequest({ message: 'One or more tables not found' })
    }

    // Check for existing registrations (avoid duplicates) - must be before validation
    const existingRegistrations = await Registration.query()
      .where('player_id', player.id)
      .whereIn('table_id', tableIds)
      .whereNot('status', 'cancelled')

    if (existingRegistrations.length > 0) {
      const existingTableIds = existingRegistrations.map((r) => r.tableId)
      return response.badRequest({
        message: 'Player is already registered for some of these tables',
        existingTableIds,
      })
    }

    // Validate selection with business rules
    const validation = await registrationRulesService.validateSelection(player, tables)
    if (!validation.valid) {
      return response.badRequest({
        message: 'Validation failed',
        errors: validation.errors,
      })
    }

    // Create registrations within a transaction
    const result = await db.transaction(async (trx) => {
      const registrations = []

      for (const table of tables) {
        // Count current active registrations for this table
        // Exclude pending_payment registrations older than expiration threshold (Layer 1 protection)
        const expirationThreshold = DateTime.now().minus({
          minutes: helloAssoConfig.paymentExpirationMinutes,
        })

        const activeCount = await Registration.query({ client: trx })
          .where('table_id', table.id)
          .where((query) => {
            query.where('status', 'paid').orWhere((subQuery) => {
              subQuery.where('status', 'pending_payment').where('updated_at', '>', expirationThreshold.toSQL()!)
            })
          })
          .count('* as total')

        const currentCount = Number(activeCount[0].$extras.total) || 0
        // Check if there is an existing waitlist
        const hasWaitlist = await waitlistService.hasWaitlist(table.id)
        const isFull = currentCount >= table.quota || hasWaitlist

        let status: 'pending_payment' | 'waitlist'
        let waitlistRank: number | null = null

        if (isFull) {
          // Table is full, add to waitlist
          status = 'waitlist'
          // Calculate waitlist rank
          const maxRank = await Registration.query({ client: trx })
            .where('table_id', table.id)
            .where('status', 'waitlist')
            .max('waitlist_rank as maxRank')

          waitlistRank = (maxRank[0].$extras.maxRank || 0) + 1
        } else {
          status = 'pending_payment'
        }

        const registration = await Registration.create(
          {
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status,
            waitlistRank,
          },
          { client: trx }
        )

        registrations.push(registration)
      }

      // Assign bib number for this player in the tournament
      const bibNumber = await bibNumberService.getOrAssignBibNumber(tournament.id, player.id, trx)

      return { registrations, bibNumber }
    })

    // Reload registrations with relations for response
    const registrationIds = result.registrations.map((r) => r.id)
    const fullRegistrations = await Registration.query()
      .whereIn('id', registrationIds)
      .preload('table')
      .preload('player')

    // If initiatePayment is requested, create HelloAsso checkout for pending_payment registrations
    if (initiatePayment) {
      const payableRegistrations = fullRegistrations.filter((r) => r.status === 'pending_payment')

      if (payableRegistrations.length > 0) {
        const payableRegistrationIds = payableRegistrations.map((r) => r.id)
        const totalAmountEuros = payableRegistrations.reduce((sum, reg) => {
          return sum + Number(reg.table.price)
        }, 0)
        const totalAmountCents = Math.round(totalAmountEuros * 100)

        if (totalAmountCents >= 100) {
          const itemName = generatePaymentReference(payableRegistrations)
          const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:5173')
          const backUrl = `${frontendUrl}/registration`
          const returnUrl = `${frontendUrl}/payment/callback?status=success`
          const errorUrl = `${frontendUrl}/payment/callback?status=error`

          try {
            // Create payment record and HelloAsso checkout
            const payment = await db.transaction(async (trx) => {
              const newPayment = await Payment.create(
                {
                  userId: user.id,
                  helloassoCheckoutIntentId: `pending_${randomUUID()}`,
                  amount: totalAmountCents,
                  status: 'pending',
                },
                { client: trx }
              )

              await newPayment.related('registrations').attach(payableRegistrationIds, trx)

              return newPayment
            })

            const checkoutResponse = await helloAssoService.initCheckout({
              totalAmount: totalAmountCents,
              itemName,
              backUrl,
              returnUrl,
              errorUrl,
              payer: {
                firstName: 'firstName' in user ? (user.firstName ?? undefined) : undefined,
                lastName: 'lastName' in user ? (user.lastName ?? undefined) : undefined,
                email: user.email,
              },
              metadata: {
                paymentId: String(payment.id),
                userId: String(user.id),
                registrationIds: payableRegistrationIds.join(','),
              },
            })

            // Update payment with actual checkoutIntentId
            payment.helloassoCheckoutIntentId = String(checkoutResponse.id)
            await payment.save()

            return response.created({
              message: 'Registrations created successfully',
              registrations: fullRegistrations,
              redirectUrl: checkoutResponse.redirectUrl,
              paymentId: payment.id,
              bibNumber: result.bibNumber,
            })
          } catch (error) {
            console.error('HelloAsso checkout error during registration:', error)
            // Payment initiation failed, but registrations are created
            // Return without redirectUrl so frontend can redirect to dashboard
            return response.created({
              message: 'Registrations created but payment initiation failed',
              registrations: fullRegistrations,
              paymentError: true,
              bibNumber: result.bibNumber,
            })
          }
        }
      }
    }

    return response.created({
      message: 'Registrations created successfully',
      registrations: fullRegistrations,
      bibNumber: result.bibNumber,
    })
  }

  /**
   * Get a single registration by ID.
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const registration = await Registration.query()
      .where('id', params.id)
      .preload('table', (query) => {
        query.preload('tournament')
      })
      .preload('player')
      .first()

    if (!registration) {
      return response.notFound({ message: 'Registration not found' })
    }

    if (registration.userId !== user.id) {
      return response.forbidden({ message: 'Cannot view registration of another user' })
    }

    // Récupérer le numéro de dossard
    const tournamentId = registration.table.tournamentId
    const bibNumber = await bibNumberService.getBibNumber(tournamentId, registration.playerId)

    return response.ok({
      ...registration.serialize(),
      bibNumber,
    })
  }

  async validate({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { playerId, tableIds } = request.all()

    // Vérifier que la période d'inscription est ouverte
    const tournament = await Tournament.first()
    if (!tournament) {
      return response.notFound({ message: 'Aucun tournoi configuré' })
    }

    const periodInfo = registrationPeriodService.getRegistrationPeriodInfo(tournament)
    if (!periodInfo.isOpen) {
      return response.badRequest({
        status: 'error',
        code: registrationPeriodService.getErrorCode(periodInfo.status),
        message: periodInfo.message,
      })
    }

    if (!playerId || !tableIds || !Array.isArray(tableIds)) {
      return response.badRequest({
        message: 'Invalid payload: playerId and tableIds (array) are required',
      })
    }

    const player = await Player.find(playerId)
    if (!player) {
      return response.notFound({ message: 'Player not found' })
    }

    if (player.userId !== user.id) {
      return response.forbidden({
        message: 'Cannot validate registration for a player not linked to your account',
      })
    }

    // Load tables with registrations count for waitlist protection check
    const tables = await Table.query()
      .whereIn('id', tableIds)
      .withCount('registrations', (query) => {
        query.whereIn('status', ['paid', 'pending_payment'])
      })
    if (tables.length !== tableIds.length) {
      return response.badRequest({ message: 'One or more tables not found' })
    }

    const validation = await registrationRulesService.validateSelection(player, tables)

    if (!validation.valid) {
      return response.badRequest({
        message: 'Validation failed',
        errors: validation.errors,
      })
    }

    return response.ok({ valid: true })
  }

  async myRegistrations({ auth, response }: HttpContext) {
    const user = auth.user!

    const registrations = await Registration.query()
      .where('user_id', user.id)
      .preload('table', (query) => {
        query.preload('tournament')
      })
      .preload('player')
      .orderBy('created_at', 'desc')

    // Get waitlist counts for tables that have waitlist registrations
    const waitlistTableIds = registrations.filter((r) => r.status === 'waitlist').map((r) => r.tableId)
    const uniqueWaitlistTableIds = [...new Set(waitlistTableIds)]

    const waitlistCounts = new Map<number, number>()
    if (uniqueWaitlistTableIds.length > 0) {
      const counts = await Registration.query()
        .whereIn('table_id', uniqueWaitlistTableIds)
        .where('status', 'waitlist')
        .groupBy('table_id')
        .select('table_id')
        .count('* as total')

      for (const row of counts) {
        waitlistCounts.set(row.tableId, Number(row.$extras.total))
      }
    }

    // Récupérer les numéros de dossard pour chaque inscription
    const registrationsWithBib = await Promise.all(
      registrations.map(async (reg) => {
        const tournamentId = reg.table.tournamentId
        const bibNumber = await bibNumberService.getBibNumber(tournamentId, reg.playerId)
        return {
          ...reg.serialize(),
          bibNumber,
          waitlistTotal: reg.status === 'waitlist' ? waitlistCounts.get(reg.tableId) || 0 : null,
        }
      })
    )

    return response.ok(registrationsWithBib)
  }

  /**
   * Cancel a registration without refund.
   * For refund, use POST /api/payments/:id/refund instead.
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const result = await cancellationService.unregisterWithoutRefund(Number(params.id), user.id)

    if (!result.success) {
      switch (result.error) {
        case 'REGISTRATION_NOT_FOUND':
          return response.notFound({ message: 'Registration not found' })
        case 'NOT_OWNER':
          return response.forbidden({ message: 'Cannot cancel registration of another user' })
        case 'INVALID_STATUS':
          return response.badRequest({ message: result.message || 'Invalid registration status' })
        default:
          return response.internalServerError({ message: 'An error occurred' })
      }
    }

    return response.ok({ message: 'Registration cancelled' })
  }

  /**
   * Get public list of registrations without sensitive data.
   * No authentication required.
   * GET /api/registrations/public
   */
  async publicList({ request, response }: HttpContext) {
    const tableId = request.input('tableId')

    let query = Registration.query()
      .whereIn('status', ['paid', 'pending_payment', 'waitlist']) // Include waitlist
      .preload('player')
      .preload('table')

    if (tableId) {
      query = query.where('table_id', tableId)
    }

    const registrations = await query.orderBy('created_at', 'desc')

    // Extract unique tournament days from tables
    const tournamentDays = [...new Set(registrations.map((r) => r.table.date.toISODate()!))].sort()

    // Get table information with registration counts
    const tableIdsSet = new Set(registrations.map((r) => r.tableId))
    const tables = await Table.query().whereIn('id', Array.from(tableIdsSet))

    // Count confirmed registrations per table (paid + pending_payment only)
    const registrationCountByTable = new Map<number, number>()
    for (const reg of registrations) {
      if (reg.status === 'paid' || reg.status === 'pending_payment') {
        const count = registrationCountByTable.get(reg.tableId) || 0
        registrationCountByTable.set(reg.tableId, count + 1)
      }
    }

    // Format public data (exclude sensitive information)
    interface PublicRegistrationData {
      player: {
        licence: string
        firstName: string
        lastName: string
        points: number
        category: string | null
        club: string
      }
      table: {
        id: number
        name: string
        date: string
        startTime: string
      }
      status: string
      waitlistRank: number | null
    }

    const publicRegistrations: PublicRegistrationData[] = registrations.map((reg) => ({
      player: {
        licence: reg.player.licence,
        firstName: reg.player.firstName,
        lastName: reg.player.lastName,
        points: reg.player.points,
        category: reg.player.category,
        club: reg.player.club,
      },
      table: {
        id: reg.table.id,
        name: reg.table.name,
        date: reg.table.date.toISODate()!,
        startTime: reg.table.startTime,
      },
      status: reg.status,
      waitlistRank: reg.waitlistRank,
    }))

    const tablesWithCounts = tables.map((table) => ({
      id: table.id,
      name: table.name,
      date: table.date.toISODate()!,
      startTime: table.startTime,
      registrationCount: registrationCountByTable.get(table.id) || 0,
    }))

    // Count unique confirmed players only
    const confirmedPlayerIds = new Set(
      registrations.filter((r) => r.status === 'paid' || r.status === 'pending_payment').map((r) => r.playerId)
    )

    return response.ok({
      registrations: publicRegistrations,
      tournamentDays,
      tables: tablesWithCounts,
      totalPlayers: confirmedPlayerIds.size,
    })
  }
}
