import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'
import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'
import User from '#models/user'
import TournamentPlayer from '#models/tournament_player'
import Payment from '#models/payment'

test.group('Admin Registrations | GET /admin/registrations', (group) => {
    group.each.setup(async () => {
        // Clean up all tables in proper order
        await Registration.query().delete()
        await TournamentPlayer.query().delete()
        await Payment.query().delete()
        await Table.query().delete()
        await Player.query().delete()
        await User.query().delete()
        await Tournament.query().delete()

        await Admin.updateOrCreate(
            { email: 'admin@example.com' },
            {
                fullName: 'Administrator',
                password: 'password',
            }
        )
    })

    test('returns empty list when no registrations', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        const response = await client.get('/admin/registrations').withGuard('admin').loginAs(admin)

        response.assertStatus(200)
        response.assertBodyContains({
            status: 'success',
            data: {
                registrations: [],
                tournamentDays: [],
            },
        })
    })

    test('returns registrations with player, table, subscriber and payment info', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table 1',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const user = await User.create({
            email: 'subscriber@example.com',
            firstName: 'Jean',
            lastName: 'Dupont',
            phone: '0612345678',
        })

        const player = await Player.create({
            licence: '1234567',
            firstName: 'Pierre',
            lastName: 'Martin',
            club: 'TT Club',
            points: 800,
            sex: 'M',
            category: 'Senior',
        })

        // Create TournamentPlayer for bib number
        await TournamentPlayer.create({
            tournamentId: tournament.id,
            playerId: player.id,
            bibNumber: 42,
        })

        const registration = await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'paid',
        })

        // Create a payment
        const payment = await Payment.create({
            userId: user.id,
            helloassoCheckoutIntentId: 'intent_123',
            helloassoOrderId: 'HA-ABC123',
            amount: 1000,
            status: 'succeeded',
        })

        // Link payment to registration
        await registration.related('payments').attach([payment.id])

        const response = await client.get('/admin/registrations').withGuard('admin').loginAs(admin)

        response.assertStatus(200)

        const body = response.body()
        assert.equal(body.status, 'success')
        assert.lengthOf(body.data.registrations, 1)
        assert.lengthOf(body.data.tournamentDays, 1)

        const reg = body.data.registrations[0]
        assert.equal(reg.status, 'paid')

        // Player info
        assert.equal(reg.player.licence, '1234567')
        assert.equal(reg.player.firstName, 'Pierre')
        assert.equal(reg.player.lastName, 'Martin')
        assert.equal(reg.player.bibNumber, 42)

        // Table info
        assert.equal(reg.table.name, 'Table 1')
        assert.include(reg.table.startTime, '10:00')

        // Subscriber info
        assert.equal(reg.subscriber.email, 'subscriber@example.com')
        assert.equal(reg.subscriber.firstName, 'Jean')
        assert.equal(reg.subscriber.phone, '0612345678')

        // Payment info
        assert.isNotNull(reg.payment)
        assert.equal(reg.payment.status, 'succeeded')
        assert.equal(reg.payment.amount, 1000)
        assert.equal(reg.payment.helloassoOrderId, 'HA-ABC123')
    })

    test('excludes cancelled registrations', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table 1',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const user = await User.create({ email: 'user@example.com' })

        const player = await Player.create({
            licence: '1234567',
            firstName: 'Test',
            lastName: 'Player',
            club: 'Club',
            points: 800,
        })

        // Create active registration
        await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'paid',
        })

        // Create cancelled registration
        const player2 = await Player.create({
            licence: '7654321',
            firstName: 'Cancelled',
            lastName: 'Player',
            club: 'Club',
            points: 700,
        })

        await Registration.create({
            userId: user.id,
            playerId: player2.id,
            tableId: table.id,
            status: 'cancelled',
        })

        const response = await client.get('/admin/registrations').withGuard('admin').loginAs(admin)

        response.assertStatus(200)

        const body = response.body()
        assert.lengthOf(body.data.registrations, 1)
        assert.equal(body.data.registrations[0].player.licence, '1234567')
    })

    test('requires admin authentication', async ({ client }) => {
        const response = await client.get('/admin/registrations')

        response.assertStatus(401)
    })
})

test.group('Admin Registrations | GET /admin/tables/:id/registrations', (group) => {
    group.each.setup(async () => {
        await Registration.query().delete()
        await TournamentPlayer.query().delete()
        await Payment.query().delete()
        await Table.query().delete()
        await Player.query().delete()
        await User.query().delete()
        await Tournament.query().delete()

        await Admin.updateOrCreate(
            { email: 'admin@example.com' },
            {
                fullName: 'Administrator',
                password: 'password',
            }
        )
    })

    test('returns registrations for specific table', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        const table1 = await Table.create({
            tournamentId: tournament.id,
            name: 'Table 1',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const table2 = await Table.create({
            tournamentId: tournament.id,
            name: 'Table 2',
            date: tournament.startDate,
            startTime: '14:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const user = await User.create({ email: 'user@example.com' })

        const player1 = await Player.create({
            licence: '1111111',
            firstName: 'Player',
            lastName: 'One',
            club: 'Club',
            points: 800,
        })

        const player2 = await Player.create({
            licence: '2222222',
            firstName: 'Player',
            lastName: 'Two',
            club: 'Club',
            points: 750,
        })

        // Registration for table 1
        await Registration.create({
            userId: user.id,
            playerId: player1.id,
            tableId: table1.id,
            status: 'paid',
        })

        // Registration for table 2
        await Registration.create({
            userId: user.id,
            playerId: player2.id,
            tableId: table2.id,
            status: 'paid',
        })

        const response = await client.get(`/admin/tables/${table1.id}/registrations`).withGuard('admin').loginAs(admin)

        response.assertStatus(200)

        const body = response.body()
        assert.equal(body.status, 'success')
        assert.lengthOf(body.data.registrations, 1)
        assert.equal(body.data.registrations[0].player.licence, '1111111')
        assert.equal(body.data.table.name, 'Table 1')
    })

    test('returns 404 for non-existent table', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        const response = await client.get('/admin/tables/99999/registrations').withGuard('admin').loginAs(admin)

        response.assertStatus(404)
        response.assertBodyContains({
            status: 'error',
            code: 'NOT_FOUND',
        })
    })

    test('returns empty list for table with no registrations', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Empty Table',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const response = await client.get(`/admin/tables/${table.id}/registrations`).withGuard('admin').loginAs(admin)

        response.assertStatus(200)

        const body = response.body()
        assert.lengthOf(body.data.registrations, 0)
        assert.equal(body.data.table.name, 'Empty Table')
    })

    test('requires admin authentication', async ({ client }) => {
        const response = await client.get('/admin/tables/1/registrations')

        response.assertStatus(401)
    })
})

// =============================================
// TESTS: POST /admin/registrations
// =============================================

test.group('Admin Registrations | POST /admin/registrations', (group) => {
    group.each.setup(async () => {
        await Registration.query().delete()
        await TournamentPlayer.query().delete()
        await Payment.query().delete()
        await Table.query().delete()
        await Player.query().delete()
        await User.query().delete()
        await Tournament.query().delete()

        await Admin.updateOrCreate(
            { email: 'admin@example.com' },
            {
                fullName: 'Administrator',
                password: 'password',
            }
        )

        // Create a tournament with a table
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        await Table.create({
            tournamentId: tournament.id,
            name: 'Table Test',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1500,
            quota: 32,
            price: 8,
            isSpecial: false,
        })
    })

    test('creates registration with cash payment collected', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        // Create a player via the FFTT mock (licence 1234567 exists in mock)
        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
                bypassRules: false,
            })

        response.assertStatus(201)

        const body = response.body()
        assert.equal(body.status, 'success')
        assert.equal(body.data.message, 'Inscription créée et payée')
        assert.lengthOf(body.data.registrations, 1)
        assert.equal(body.data.registrations[0].status, 'paid')
        assert.equal(body.data.payment.status, 'succeeded')
        assert.equal(body.data.payment.paymentMethod, 'cash')

        // Verify in database
        const registration = await Registration.findOrFail(body.data.registrations[0].id)
        assert.isTrue(registration.isAdminCreated)
        assert.equal(registration.status, 'paid')

        // Verify player was created
        const player = await Player.findByOrFail('licence', '1234567')
        assert.isNotNull(player)
    })

    test('creates registration with check payment not collected', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'check',
                collected: false,
                bypassRules: false,
            })

        response.assertStatus(201)

        const body = response.body()
        assert.equal(body.data.registrations[0].status, 'pending_payment')
        assert.equal(body.data.payment.status, 'pending')
        assert.equal(body.data.payment.paymentMethod, 'check')
    })

    test('creates registration with card payment collected', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'card',
                collected: true,
                bypassRules: false,
            })

        response.assertStatus(201)

        const body = response.body()
        assert.equal(body.data.registrations[0].status, 'paid')
        assert.equal(body.data.payment.status, 'succeeded')
        assert.equal(body.data.payment.paymentMethod, 'card')
    })

    test('creates system user for admin registrations', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        // Ensure no system user exists
        await User.query().where('email', 'system@tournament.local').delete()

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response.assertStatus(201)

        // Verify system user was created
        const systemUser = await User.findBy('email', 'system@tournament.local')
        assert.isNotNull(systemUser)
        assert.equal(systemUser!.fullName, 'Système')
    })

    test('marks registration as isAdminCreated', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response.assertStatus(201)

        const registration = await Registration.findOrFail(response.body().data.registrations[0].id)
        assert.isTrue(registration.isAdminCreated)
    })

    test('validates player points eligibility', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        // Create a table with very high points requirement
        const tournament = await Tournament.findByOrFail('name', 'Test Tournament')
        const highPointsTable = await Table.create({
            tournamentId: tournament.id,
            name: 'High Points Table',
            date: tournament.startDate,
            startTime: '14:00',
            pointsMin: 2000,
            pointsMax: 3000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        // Try to register a player with 800 points (mock player 1234567 has ~800 points)
        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [highPointsTable.id],
                paymentMethod: 'cash',
                collected: true,
                bypassRules: false,
            })

        // Should fail validation (points too low)
        response.assertStatus(400)
        response.assertBodyContains({
            status: 'error',
            code: 'VALIDATION_ERROR',
        })
    })

    test('bypasses rules when bypassRules is true', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const tournament = await Tournament.findByOrFail('name', 'Test Tournament')

        // Create a full table
        const fullTable = await Table.create({
            tournamentId: tournament.id,
            name: 'Full Table',
            date: tournament.startDate,
            startTime: '16:00',
            pointsMin: 500,
            pointsMax: 1500,
            quota: 1, // Only 1 spot
            price: 10,
            isSpecial: false,
        })

        // Create a user and fill the table
        const user = await User.create({ email: 'filler@test.com' })
        const fillerPlayer = await Player.create({
            licence: '9999999',
            firstName: 'Filler',
            lastName: 'Player',
            club: 'Club',
            points: 800,
        })
        await Registration.create({
            userId: user.id,
            playerId: fillerPlayer.id,
            tableId: fullTable.id,
            status: 'paid',
        })

        // Try to register with bypass
        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [fullTable.id],
                paymentMethod: 'cash',
                collected: true,
                bypassRules: true, // Bypass the quota limit
            })

        response.assertStatus(201)

        const body = response.body()
        assert.lengthOf(body.data.registrations, 1)
        assert.equal(body.data.registrations[0].status, 'paid')
    })

    test('returns 404 for invalid player licence', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '0000000', // Non-existent in FFTT mock
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response.assertStatus(404)
        response.assertBodyContains({
            status: 'error',
            code: 'NOT_FOUND',
        })
    })

    test('returns validation error for invalid table IDs', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [99999], // Non-existent table
                paymentMethod: 'cash',
                collected: true,
            })

        response.assertStatus(400)
        response.assertBodyContains({
            status: 'error',
        })
    })

    test('requires admin authentication', async ({ client }) => {
        const response = await client.post('/admin/registrations').json({
            licence: '1234567',
            tableIds: [1],
            paymentMethod: 'cash',
            collected: true,
        })

        response.assertStatus(401)
    })

    test('assigns bib number for admin-created registration', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response.assertStatus(201)

        // Verify bib number was assigned
        const player = await Player.findByOrFail('licence', '1234567')
        const tournament = await Tournament.findByOrFail('name', 'Test Tournament')
        const tournamentPlayer = await TournamentPlayer.query()
            .where('tournament_id', tournament.id)
            .where('player_id', player.id)
            .first()

        assert.isNotNull(tournamentPlayer)
        assert.isNumber(tournamentPlayer!.bibNumber)
        assert.isAtLeast(tournamentPlayer!.bibNumber, 1)
    })

    test('keeps same bib number for multiple admin registrations of same player', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const tournament = await Tournament.findByOrFail('name', 'Test Tournament')

        // Create a second table
        const table2 = await Table.create({
            tournamentId: tournament.id,
            name: 'Table Test 2',
            date: tournament.startDate,
            startTime: '14:00',
            pointsMin: 500,
            pointsMax: 1500,
            quota: 32,
            price: 8,
            isSpecial: false,
        })

        const table1 = await Table.findByOrFail('name', 'Table Test')

        // First registration
        const response1 = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table1.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response1.assertStatus(201)

        // Get bib number from first registration
        const player = await Player.findByOrFail('licence', '1234567')
        const tournamentPlayer1 = await TournamentPlayer.query()
            .where('tournament_id', tournament.id)
            .where('player_id', player.id)
            .firstOrFail()
        const firstBibNumber = tournamentPlayer1.bibNumber

        // Second registration for same player on different table
        const response2 = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table2.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response2.assertStatus(201)

        // Verify same bib number
        await tournamentPlayer1.refresh()
        assert.equal(tournamentPlayer1.bibNumber, firstBibNumber)
    })

    test('prevents duplicate registration on same table', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        // First registration
        const response1 = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response1.assertStatus(201)

        // Try to register same player on same table again
        const response2 = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response2.assertStatus(400)
        response2.assertBodyContains({
            status: 'error',
            code: 'ALREADY_REGISTERED',
        })
    })

    test('prevents duplicate registration even with bypass rules', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        // First registration
        const response1 = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
            })

        response1.assertStatus(201)

        // Try to register same player with bypass - should still fail
        const response2 = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'cash',
                collected: true,
                bypassRules: true, // Even with bypass, duplicate check cannot be bypassed
            })

        response2.assertStatus(400)
        response2.assertBodyContains({
            status: 'error',
            code: 'ALREADY_REGISTERED',
        })
    })
})

// =============================================
// TESTS: PATCH /admin/payments/:id/collect
// =============================================

test.group('Admin Payments | PATCH /admin/payments/:id/collect', (group) => {
    group.each.setup(async () => {
        await Registration.query().delete()
        await TournamentPlayer.query().delete()
        await Payment.query().delete()
        await Table.query().delete()
        await Player.query().delete()
        await User.query().delete()
        await Tournament.query().delete()

        await Admin.updateOrCreate(
            { email: 'admin@example.com' },
            {
                fullName: 'Administrator',
                password: 'password',
            }
        )
    })

    test('marks pending offline payment as collected', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        // Create test data
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table Test',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1500,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const user = await User.create({ email: 'test@test.com' })
        const player = await Player.create({
            licence: '1234567',
            firstName: 'Test',
            lastName: 'Player',
            club: 'Club',
            points: 800,
        })

        const payment = await Payment.create({
            userId: user.id,
            helloassoCheckoutIntentId: 'admin-123',
            amount: 10,
            status: 'pending',
            paymentMethod: 'cash',
        })

        const registration = await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'pending_payment',
            isAdminCreated: true,
        })

        await payment.related('registrations').attach([registration.id])

        const response = await client.patch(`/admin/payments/${payment.id}/collect`).withGuard('admin').loginAs(admin)

        response.assertStatus(200)

        const body = response.body()
        assert.equal(body.status, 'success')
        assert.equal(body.data.status, 'succeeded')
        assert.equal(body.data.paymentMethod, 'cash')
        assert.lengthOf(body.data.registrations, 1)
        assert.equal(body.data.registrations[0].status, 'paid')

        // Verify in database
        await payment.refresh()
        await registration.refresh()
        assert.equal(payment.status, 'succeeded')
        assert.equal(registration.status, 'paid')
    })

    test('rejects collecting already succeeded payment', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const user = await User.create({ email: 'test@test.com' })

        const payment = await Payment.create({
            userId: user.id,
            helloassoCheckoutIntentId: 'admin-123',
            amount: 10,
            status: 'succeeded', // Already collected
            paymentMethod: 'cash',
        })

        const response = await client.patch(`/admin/payments/${payment.id}/collect`).withGuard('admin').loginAs(admin)

        response.assertStatus(400)
        response.assertBodyContains({
            status: 'error',
        })
    })

    test('rejects collecting HelloAsso payment', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const user = await User.create({ email: 'test@test.com' })

        const payment = await Payment.create({
            userId: user.id,
            helloassoCheckoutIntentId: 'ha-123',
            amount: 10,
            status: 'pending',
            paymentMethod: 'helloasso', // Can't manually collect HelloAsso
        })

        const response = await client.patch(`/admin/payments/${payment.id}/collect`).withGuard('admin').loginAs(admin)

        response.assertStatus(400)
        response.assertBodyContains({
            status: 'error',
        })
    })

    test('returns 404 for non-existent payment', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        const response = await client.patch('/admin/payments/99999/collect').withGuard('admin').loginAs(admin)

        response.assertStatus(404)
    })

    test('requires admin authentication', async ({ client }) => {
        const response = await client.patch('/admin/payments/1/collect')

        response.assertStatus(401)
    })
})

// =============================================
// TESTS: POST /admin/registrations with HelloAsso
// =============================================

test.group('Admin Registrations | HelloAsso Integration', (group) => {
    let originalFetch: typeof global.fetch

    group.each.setup(async () => {
        // Save original fetch
        originalFetch = global.fetch

        // Clean up all tables in proper order
        await Registration.query().delete()
        await TournamentPlayer.query().delete()
        await Payment.query().delete()
        await Table.query().delete()
        await Player.query().delete()
        await User.query().delete()
        await Tournament.query().delete()

        await Admin.updateOrCreate(
            { email: 'admin@example.com' },
            {
                fullName: 'Administrator',
                password: 'password',
            }
        )

        // Create a tournament with a table
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        await Table.create({
            tournamentId: tournament.id,
            name: 'Table Test',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1500,
            quota: 32,
            price: 8,
            isSpecial: false,
        })

        // Mock HelloAsso API
        global.fetch = async (url) => {
            const urlString = url.toString()

            // Auth call
            if (urlString.includes('oauth2/token')) {
                return new Response(
                    JSON.stringify({
                        access_token: 'test-token',
                        refresh_token: 'test-refresh',
                        token_type: 'Bearer',
                        expires_in: 3600,
                    }),
                    { status: 200 }
                )
            }

            // Checkout intent creation
            if (urlString.includes('checkout-intents')) {
                return new Response(
                    JSON.stringify({
                        id: 12345,
                        redirectUrl: 'https://www.helloasso-sandbox.com/checkout/12345',
                    }),
                    { status: 200 }
                )
            }

            // Default: return 404
            return new Response('Not found', { status: 404 })
        }
    })

    group.each.teardown(() => {
        global.fetch = originalFetch
    })

    test('creates admin registration with HelloAsso payment and returns checkout URL', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const table = await Table.findByOrFail('name', 'Table Test')

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table.id],
                paymentMethod: 'helloasso',
            })

        response.assertStatus(201)

        const body = response.body()
        assert.equal(body.status, 'success')
        assert.equal(body.data.message, 'Inscription créée avec lien de paiement HelloAsso')
        assert.exists(body.data.checkoutUrl)
        assert.include(body.data.checkoutUrl, 'helloasso')
        assert.lengthOf(body.data.registrations, 1)
        assert.equal(body.data.registrations[0].status, 'pending_payment')
        assert.equal(body.data.payment.status, 'pending')
        assert.equal(body.data.payment.paymentMethod, 'helloasso')
    })

    test('creates admin registration with HelloAsso for multiple tables', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')
        const tournament = await Tournament.findByOrFail('name', 'Test Tournament')

        // Create second table
        const table2 = await Table.create({
            tournamentId: tournament.id,
            name: 'Table Test 2',
            date: tournament.startDate,
            startTime: '14:00',
            pointsMin: 500,
            pointsMax: 1500,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const table1 = await Table.findByOrFail('name', 'Table Test')

        const response = await client
            .post('/admin/registrations')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                licence: '1234567',
                tableIds: [table1.id, table2.id],
                paymentMethod: 'helloasso',
            })

        response.assertStatus(201)

        const body = response.body()
        assert.equal(body.status, 'success')
        assert.lengthOf(body.data.registrations, 2)
        assert.exists(body.data.checkoutUrl)
        // Total should be 8 + 10 = 18 euros = 1800 cents
        assert.equal(body.data.payment.amount, 1800)
    })
})

// =============================================
// TESTS: POST /admin/registrations/:id/generate-payment-link
// =============================================

test.group('Admin Registrations | Generate Payment Link', (group) => {
    let originalFetch: typeof global.fetch

    group.each.setup(async () => {
        // Save original fetch
        originalFetch = global.fetch

        // Clean up all tables in proper order
        await Registration.query().delete()
        await TournamentPlayer.query().delete()
        await Payment.query().delete()
        await Table.query().delete()
        await Player.query().delete()
        await User.query().delete()
        await Tournament.query().delete()

        await Admin.updateOrCreate(
            { email: 'admin@example.com' },
            {
                fullName: 'Administrator',
                password: 'password',
            }
        )

        // Mock HelloAsso API
        global.fetch = async (url) => {
            const urlString = url.toString()

            // Auth call
            if (urlString.includes('oauth2/token')) {
                return new Response(
                    JSON.stringify({
                        access_token: 'test-token',
                        refresh_token: 'test-refresh',
                        token_type: 'Bearer',
                        expires_in: 3600,
                    }),
                    { status: 200 }
                )
            }

            // Checkout intent creation
            if (urlString.includes('checkout-intents')) {
                return new Response(
                    JSON.stringify({
                        id: 67890,
                        redirectUrl: 'https://www.helloasso-sandbox.com/checkout/67890',
                    }),
                    { status: 200 }
                )
            }

            // Default: return 404
            return new Response('Not found', { status: 404 })
        }
    })

    group.each.teardown(() => {
        global.fetch = originalFetch
    })

    test('generates payment link for existing pending_payment registration', async ({ client, assert }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        // Create test data
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table Test',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1500,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const user = await User.create({ email: 'test@test.com' })
        const player = await Player.create({
            licence: '1234567',
            firstName: 'Test',
            lastName: 'Player',
            club: 'Club',
            points: 800,
        })

        const payment = await Payment.create({
            userId: user.id,
            helloassoCheckoutIntentId: 'admin-123',
            amount: 1000,
            status: 'pending',
            paymentMethod: 'check',
        })

        const registration = await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'pending_payment',
            isAdminCreated: true,
        })

        await payment.related('registrations').attach([registration.id])

        const response = await client
            .post(`/admin/registrations/${registration.id}/generate-payment-link`)
            .withGuard('admin')
            .loginAs(admin)
            .json({
                email: 'player@example.com',
            })

        response.assertStatus(200)

        const body = response.body()
        assert.equal(body.status, 'success')
        assert.exists(body.data.checkoutUrl)
        assert.include(body.data.checkoutUrl, 'helloasso')
        assert.equal(body.data.payment.status, 'pending')
        assert.equal(body.data.payment.amount, 1000)
    })

    test('rejects payment link generation for paid registration', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        // Create test data
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Paris',
        })

        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table Test',
            date: tournament.startDate,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1500,
            quota: 32,
            price: 10,
            isSpecial: false,
        })

        const user = await User.create({ email: 'test@test.com' })
        const player = await Player.create({
            licence: '1234567',
            firstName: 'Test',
            lastName: 'Player',
            club: 'Club',
            points: 800,
        })

        const registration = await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'paid', // Already paid
            isAdminCreated: true,
        })

        const response = await client
            .post(`/admin/registrations/${registration.id}/generate-payment-link`)
            .withGuard('admin')
            .loginAs(admin)
            .json({
                email: 'player@example.com',
            })

        response.assertStatus(400)
        response.assertBodyContains({
            status: 'error',
        })
    })

    test('returns 404 for non-existent registration', async ({ client }) => {
        const admin = await Admin.findByOrFail('email', 'admin@example.com')

        const response = await client
            .post('/admin/registrations/99999/generate-payment-link')
            .withGuard('admin')
            .loginAs(admin)
            .json({
                email: 'player@example.com',
            })

        response.assertStatus(404)
    })

    test('requires admin authentication', async ({ client }) => {
        const response = await client.post('/admin/registrations/1/generate-payment-link').json({
            email: 'player@example.com',
        })

        response.assertStatus(401)
    })
})
