import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
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
import bibNumberService from '#services/bib_number_service'
import mailService from '#services/mail_service'
import env from '#start/env'
import { createAdminRegistrationValidator, generatePaymentLinkValidator } from '#validators/admin_registration'
import logger from '@adonisjs/core/services/logger'

interface RegistrationData {
    id: number
    status: string
    waitlistRank: number | null
    isAdminCreated: boolean
    checkedInAt: string | null
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
                checkedInAt: reg.checkedInAt ? reg.checkedInAt.toFormat('HH:mm') : null,
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
                checkedInAt: reg.checkedInAt ? reg.checkedInAt.toFormat('HH:mm') : null,
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

        // Send notification email to user (non-blocking: email failure should not fail the promotion)
        const user = registration.user
        const table = registration.table
        const player = registration.player
        const timerHours = tournament.options.waitlistTimerHours || 4
        const dashboardUrl = env.get('FRONTEND_URL', 'http://localhost:5173') + '/dashboard'

        let emailSent = true
        try {
            await mailService.sendWaitlistPromoted({
                email: user.email,
                tableName: table.name,
                playerFirstName: player.firstName,
                playerLastName: player.lastName,
                timerHours,
                dashboardUrl,
            })
        } catch (emailError) {
            emailSent = false
            logger.error({ err: emailError, registrationId, email: user.email }, 'Failed to send waitlist promotion email')
        }

        // Reload registration to get updated data
        await registration.refresh()

        return success(ctx, {
            message: emailSent
                ? 'Registration promoted successfully'
                : 'Registration promoted successfully, but notification email failed to send',
            registration: {
                id: registration.id,
                status: registration.status,
                waitlistRank: registration.waitlistRank,
            },
            emailSent,
        })
    }

    /**
     * Create a new registration as admin.
     * POST /admin/registrations
     *
     * Uses a database transaction to ensure atomicity:
     * either all operations succeed, or none do.
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

        // Check for existing registrations (NEVER bypassable - player cannot be registered twice for same table)
        const existingRegistrations = await Registration.query()
            .where('player_id', player.id)
            .whereIn('table_id', payload.tableIds)
            .whereIn('status', ['paid', 'pending_payment', 'waitlist'])

        if (existingRegistrations.length > 0) {
            const existingTableIds = existingRegistrations.map((r) => r.tableId)
            const existingTableNames = tables.filter((t) => existingTableIds.includes(t.id)).map((t) => t.name)
            return error(
                ctx,
                'ALREADY_REGISTERED',
                `Le joueur est déjà inscrit au(x) tableau(x): ${existingTableNames.join(', ')}`,
                400
            )
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
        }

        // For HelloAsso, generate checkout BEFORE transaction (external API call)
        let helloassoCheckoutId: string | null = null
        if (payload.paymentMethod === 'helloasso') {
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
            helloassoCheckoutId = String(checkout.id)
        }

        // Execute all database operations in a transaction
        const result = await db.transaction(async (trx) => {
            // Get tournament for bib number assignment
            const tournament = await Tournament.query({ client: trx }).first()

            // Assign bib number FIRST (this was failing before)
            if (tournament) {
                await bibNumberService.getOrAssignBibNumber(tournament.id, player.id, trx)
            }

            // Create payment record
            const payment = await Payment.create(
                {
                    userId: systemUser.id,
                    helloassoCheckoutIntentId:
                        payload.paymentMethod === 'helloasso' ? helloassoCheckoutId! : `admin-${Date.now()}`,
                    amount: Math.round(totalAmount * 100),
                    status: payload.paymentMethod === 'helloasso' ? 'pending' : paymentStatus,
                    paymentMethod: payload.paymentMethod,
                },
                { client: trx }
            )

            // Create registrations
            const registrations: Registration[] = []
            for (const table of tables) {
                const registration = await Registration.create(
                    {
                        userId: systemUser.id,
                        playerId: player.id,
                        tableId: table.id,
                        status: payload.paymentMethod === 'helloasso' ? 'pending_payment' : registrationStatus,
                        isAdminCreated: true,
                    },
                    { client: trx }
                )
                registrations.push(registration)
            }

            // Link registrations to payment
            await payment.related('registrations').attach(
                registrations.map((r) => r.id),
                trx
            )

            return { payment, registrations }
        })

        // Return response based on payment method
        if (payload.paymentMethod === 'helloasso') {
            return created(ctx, {
                message: 'Inscription créée avec lien de paiement HelloAsso',
                registrations: result.registrations.map((r) => ({
                    id: r.id,
                    status: r.status,
                    tableId: r.tableId,
                })),
                payment: {
                    id: result.payment.id,
                    status: result.payment.status,
                    amount: result.payment.amount,
                    paymentMethod: result.payment.paymentMethod,
                },
                checkoutUrl,
            })
        }

        return created(ctx, {
            message: isCollected ? 'Inscription créée et payée' : 'Inscription créée en attente de paiement',
            registrations: result.registrations.map((r) => ({
                id: r.id,
                status: r.status,
                tableId: r.tableId,
            })),
            payment: {
                id: result.payment.id,
                status: result.payment.status,
                amount: result.payment.amount,
                paymentMethod: result.payment.paymentMethod,
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
        // Note: table.price comes as string from PostgreSQL decimal, needs Number() conversion
        const totalAmount = relatedRegistrations.reduce((sum, r) => sum + Number(r.table.price), 0)

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
