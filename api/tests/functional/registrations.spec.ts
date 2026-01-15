import { test } from '@japa/runner'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import { DateTime } from 'luxon'

test.group('Registrations', (group) => {
    group.each.setup(async () => {
        await Registration.query().delete()
        await Player.query().delete()
        await Table.query().delete()
        await Tournament.query().delete()
        await User.query().delete()
    })

    test('list registrations returns empty list when no registrations', async ({ client }) => {
        const user = await User.create({ email: 'user@example.com' })

        const response = await client.get('/api/me/registrations').loginAs(user)

        response.assertStatus(200)
        response.assertBody([])
    })

    test('list registrations returns user registrations', async ({ client }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })
        const registration = await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'pending_payment',
        })

        const response = await client.get('/api/me/registrations').loginAs(user)

        response.assertStatus(200)
        response.assertBodyContains([
            {
                id: registration.id,
                status: 'pending_payment',
                table: {
                    id: table.id,
                    name: 'Table A',
                    tournament: {
                        id: tournament.id,
                        name: 'Test Tournament',
                    },
                },
                player: {
                    id: player.id,
                    firstName: 'John',
                },
            },
        ])
    })

    test('cancel registration changes status to cancelled', async ({ client, assert }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })
        const registration = await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'pending_payment',
        })

        const response = await client.delete(`/api/registrations/${registration.id}`).loginAs(user)

        response.assertStatus(200)

        await registration.refresh()
        assert.equal(registration.status, 'cancelled')
    })

    test('cannot cancel registration of another user', async ({ client }) => {
        const user1 = await User.create({ email: 'user1@example.com' })
        const user2 = await User.create({ email: 'user2@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user1.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })
        const registration = await Registration.create({
            userId: user1.id,
            playerId: player.id,
            tableId: table.id,
            status: 'pending_payment',
        })

        const response = await client.delete(`/api/registrations/${registration.id}`).loginAs(user2)

        response.assertStatus(403)
    })
})

test.group('Registrations Validation', (group) => {
    group.each.setup(async () => {
        await Registration.query().delete()
        await Player.query().delete()
        await Table.query().delete()
        await Tournament.query().delete()
        await User.query().delete()
    })

    test('validate selection succeeds with eligible tables', async ({ client }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        const response = await client
            .post('/api/registrations/validate')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user)

        response.assertStatus(200)
        response.assertBodyContains({ valid: true })
    })

    test('validate selection fails if player not linked to user', async ({ client }) => {
        const user1 = await User.create({ email: 'user1@example.com' })
        const user2 = await User.create({ email: 'user2@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user1.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        const response = await client
            .post('/api/registrations/validate')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user2)

        response.assertStatus(403)
    })

    test('validate selection fails with points too high', async ({ client }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 1500,
        })

        const response = await client
            .post('/api/registrations/validate')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user)

        response.assertStatus(400)
        response.assertBodyContains({ message: 'Validation failed' })
    })

    test('validate selection fails with daily limit exceeded', async ({ client }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const today = DateTime.now().startOf('day')
        const table1 = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: today,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 2000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const table2 = await Table.create({
            tournamentId: tournament.id,
            name: 'Table B',
            date: today,
            startTime: '14:00',
            pointsMin: 500,
            pointsMax: 2000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const table3 = await Table.create({
            tournamentId: tournament.id,
            name: 'Table C',
            date: today,
            startTime: '18:00',
            pointsMin: 500,
            pointsMax: 2000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        const response = await client
            .post('/api/registrations/validate')
            .json({
                playerId: player.id,
                tableIds: [table1.id, table2.id, table3.id],
            })
            .loginAs(user)

        response.assertStatus(400)
        response.assertBodyContains({ message: 'Validation failed' })
    })

    test('validate selection requires authentication', async ({ client }) => {
        const response = await client.post('/api/registrations/validate').json({
            playerId: 1,
            tableIds: [1],
        })

        response.assertStatus(401)
    })
})

test.group('Registrations Store', (group) => {
    group.each.setup(async () => {
        await Registration.query().delete()
        await Player.query().delete()
        await Table.query().delete()
        await Tournament.query().delete()
        await User.query().delete()
    })

    test('create registration with pending_payment status when table has space', async ({ client, assert }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        const response = await client
            .post('/api/registrations')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user)

        response.assertStatus(201)
        response.assertBodyContains({
            message: 'Registrations created successfully',
        })

        const body = response.body()
        assert.lengthOf(body.registrations, 1)
        assert.equal(body.registrations[0].status, 'pending_payment')
        assert.isNull(body.registrations[0].waitlistRank)
    })

    test('create registration with waitlist status when table is full', async ({ client, assert }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 2,
            price: 10,
            isSpecial: false,
        })

        // Fill the table
        const otherUser = await User.create({ email: 'other@example.com' })
        const otherPlayer1 = await Player.create({
            userId: otherUser.id,
            licence: '111111',
            firstName: 'Other1',
            lastName: 'Player1',
            club: 'Club',
            points: 700,
        })
        const otherPlayer2 = await Player.create({
            userId: otherUser.id,
            licence: '222222',
            firstName: 'Other2',
            lastName: 'Player2',
            club: 'Club',
            points: 700,
        })
        await Registration.create({
            userId: otherUser.id,
            playerId: otherPlayer1.id,
            tableId: table.id,
            status: 'pending_payment',
        })
        await Registration.create({
            userId: otherUser.id,
            playerId: otherPlayer2.id,
            tableId: table.id,
            status: 'paid',
        })

        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        const response = await client
            .post('/api/registrations')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user)

        response.assertStatus(201)

        const body = response.body()
        assert.lengthOf(body.registrations, 1)
        assert.equal(body.registrations[0].status, 'waitlist')
        assert.equal(body.registrations[0].waitlistRank, 1)
    })

    test('waitlist rank is calculated correctly', async ({ client, assert }) => {
        const user = await User.create({ email: 'user@example.com' })
        const user2 = await User.create({ email: 'user2@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 1,
            price: 10,
            isSpecial: false,
        })

        // Fill the table and add one to waitlist
        const otherUser = await User.create({ email: 'other@example.com' })
        const otherPlayer = await Player.create({
            userId: otherUser.id,
            licence: '111111',
            firstName: 'Other',
            lastName: 'Player',
            club: 'Club',
            points: 700,
        })
        await Registration.create({
            userId: otherUser.id,
            playerId: otherPlayer.id,
            tableId: table.id,
            status: 'paid',
        })

        // First waitlist entry
        const waitlistPlayer = await Player.create({
            userId: user2.id,
            licence: '333333',
            firstName: 'Waitlist',
            lastName: 'First',
            club: 'Club',
            points: 750,
        })
        await Registration.create({
            userId: user2.id,
            playerId: waitlistPlayer.id,
            tableId: table.id,
            status: 'waitlist',
            waitlistRank: 1,
        })

        // Now register another player - should be rank 2
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        const response = await client
            .post('/api/registrations')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user)

        response.assertStatus(201)

        const body = response.body()
        assert.equal(body.registrations[0].status, 'waitlist')
        assert.equal(body.registrations[0].waitlistRank, 2)
    })

    test('cannot create duplicate registration', async ({ client }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        // Use a different day to avoid time conflict validation
        const tomorrow = DateTime.now().plus({ days: 1 })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: tomorrow,
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        // Create first registration
        await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'pending_payment',
        })

        // Try to create duplicate
        const response = await client
            .post('/api/registrations')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user)

        response.assertStatus(400)
        response.assertBodyContains({
            message: 'Player is already registered for some of these tables',
        })
    })

    test('can register for table if previous registration was cancelled', async ({ client, assert }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        // Create cancelled registration
        await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'cancelled',
        })

        // Should be able to register again
        const response = await client
            .post('/api/registrations')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user)

        response.assertStatus(201)
        const body = response.body()
        assert.equal(body.registrations[0].status, 'pending_payment')
    })

    test('cannot create registration for player not linked to user', async ({ client }) => {
        const user1 = await User.create({ email: 'user1@example.com' })
        const user2 = await User.create({ email: 'user2@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user1.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })

        const response = await client
            .post('/api/registrations')
            .json({
                playerId: player.id,
                tableIds: [table.id],
            })
            .loginAs(user2)

        response.assertStatus(403)
    })

    test('create registration requires authentication', async ({ client }) => {
        const response = await client.post('/api/registrations').json({
            playerId: 1,
            tableIds: [1],
        })

        response.assertStatus(401)
    })
})

test.group('Registrations Show', (group) => {
    group.each.setup(async () => {
        await Registration.query().delete()
        await Player.query().delete()
        await Table.query().delete()
        await Tournament.query().delete()
        await User.query().delete()
    })

    test('get registration details', async ({ client }) => {
        const user = await User.create({ email: 'user@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })
        const registration = await Registration.create({
            userId: user.id,
            playerId: player.id,
            tableId: table.id,
            status: 'pending_payment',
        })

        const response = await client.get(`/api/registrations/${registration.id}`).loginAs(user)

        response.assertStatus(200)
        response.assertBodyContains({
            id: registration.id,
            status: 'pending_payment',
            table: {
                id: table.id,
                name: 'Table A',
            },
            player: {
                id: player.id,
                firstName: 'John',
            },
        })
    })

    test('cannot get registration of another user', async ({ client }) => {
        const user1 = await User.create({ email: 'user1@example.com' })
        const user2 = await User.create({ email: 'user2@example.com' })
        const tournament = await Tournament.create({
            name: 'Test Tournament',
            startDate: DateTime.now(),
            endDate: DateTime.now().plus({ days: 1 }),
            location: 'Test Location',
            options: {
                refundDeadline: null,
                waitlistTimerHours: 4,
                registrationStartDate: null,
                registrationEndDate: null,
            },
        })
        const table = await Table.create({
            tournamentId: tournament.id,
            name: 'Table A',
            date: DateTime.now(),
            startTime: '10:00',
            pointsMin: 500,
            pointsMax: 1000,
            quota: 32,
            price: 10,
            isSpecial: false,
        })
        const player = await Player.create({
            userId: user1.id,
            licence: '123456',
            firstName: 'John',
            lastName: 'Doe',
            club: 'Test Club',
            points: 800,
        })
        const registration = await Registration.create({
            userId: user1.id,
            playerId: player.id,
            tableId: table.id,
            status: 'pending_payment',
        })

        const response = await client.get(`/api/registrations/${registration.id}`).loginAs(user2)

        response.assertStatus(403)
    })

    test('get registration returns 404 for non-existent registration', async ({ client }) => {
        const user = await User.create({ email: 'user@example.com' })

        const response = await client.get('/api/registrations/99999').loginAs(user)

        response.assertStatus(404)
    })
})
