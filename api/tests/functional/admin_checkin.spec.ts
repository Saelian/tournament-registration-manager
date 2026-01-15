import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'
import Table from '#models/table'
import Player from '#models/player'
import User from '#models/user'
import Registration from '#models/registration'

test.group('Admin Checkin', (group) => {
    let admin: Admin
    let tournament: Tournament
    let table1: Table
    let player1: Player
    let player2: Player
    let user: User
    let registration1: Registration
    let registration2: Registration

    group.each.setup(async () => {
        // Create admin
        admin = await Admin.updateOrCreate(
            { email: 'admin@example.com' },
            { fullName: 'Administrator', password: 'password' }
        )

        // Create tournament
        tournament = await Tournament.updateOrCreate(
            { name: 'Test Tournament' },
            {
                startDate: DateTime.now(),
                endDate: DateTime.now().plus({ days: 1 }),
                location: 'Test Location',
                options: Tournament.defaultOptions,
            }
        )

        // Create tables on different days
        const today = DateTime.now().startOf('day')
        const tomorrow = today.plus({ days: 1 })

        table1 = await Table.updateOrCreate(
            { tournamentId: tournament.id, name: 'Table A' },
            {
                date: today,
                startTime: '10:00',
                pointsMin: 0,
                pointsMax: 1000,
                quota: 16,
                price: 10,
                isSpecial: false,
                genderRestriction: null,
                nonNumberedOnly: false,
            }
        )

        await Table.updateOrCreate(
            { tournamentId: tournament.id, name: 'Table B' },
            {
                date: tomorrow,
                startTime: '14:00',
                pointsMin: 0,
                pointsMax: 2000,
                quota: 16,
                price: 10,
                isSpecial: false,
                genderRestriction: null,
                nonNumberedOnly: false,
            }
        )

        // Create user
        user = await User.updateOrCreate({ email: 'user@example.com' }, { firstName: 'John', lastName: 'Doe' })

        // Create players
        player1 = await Player.updateOrCreate(
            { licence: '123456' },
            {
                firstName: 'Alice',
                lastName: 'Smith',
                club: 'Club A',
                points: 800,
                sex: 'F',
                category: 'S',
            }
        )

        player2 = await Player.updateOrCreate(
            { licence: '654321' },
            {
                firstName: 'Bob',
                lastName: 'Johnson',
                club: 'Club B',
                points: 1200,
                sex: 'M',
                category: 'S',
            }
        )

        // Create registrations with presenceStatus = 'unknown' (default)
        registration1 = await Registration.updateOrCreate(
            { playerId: player1.id, tableId: table1.id },
            {
                userId: user.id,
                status: 'paid',
                checkedInAt: null,
                presenceStatus: 'unknown',
            }
        )

        registration2 = await Registration.updateOrCreate(
            { playerId: player2.id, tableId: table1.id },
            {
                userId: user.id,
                status: 'paid',
                checkedInAt: null,
                presenceStatus: 'unknown',
            }
        )
    })

    test('GET /admin/checkin/days returns tournament days', async ({ client, assert }) => {
        const response = await client.get('/admin/checkin/days').withGuard('admin').loginAs(admin)

        response.assertStatus(200)
        response.assertBodyContains({
            status: 'success',
        })

        const body = response.body()
        assert.equal(body.data.days.length, 2)
    })

    test('GET /admin/checkin/:date/players returns players for the day with stats', async ({ client, assert }) => {
        const today = DateTime.now().startOf('day').toISODate()

        const response = await client.get(`/admin/checkin/${today}/players`).withGuard('admin').loginAs(admin)

        response.assertStatus(200)
        response.assertBodyContains({
            status: 'success',
        })

        const body = response.body()
        assert.equal(body.data.players.length, 2)
        assert.equal(body.data.stats.total, 2)
        assert.equal(body.data.stats.present, 0)
        assert.equal(body.data.stats.absent, 0)
        assert.equal(body.data.stats.unknown, 2)
    })

    test('POST /admin/checkin/:registrationId checks in a player', async ({ client, assert }) => {
        const response = await client.post(`/admin/checkin/${registration1.id}`).withGuard('admin').loginAs(admin)

        response.assertStatus(200)
        response.assertBodyContains({
            status: 'success',
            data: {
                playerId: player1.id,
                presenceStatus: 'present',
            },
        })

        const body = response.body()
        assert.isNotNull(body.data.checkedInAt)

        // Verify in database
        await registration1.refresh()
        assert.isNotNull(registration1.checkedInAt)
        assert.equal(registration1.presenceStatus, 'present')
    })

    test('POST /admin/checkin/:registrationId/absent marks player as absent', async ({ client, assert }) => {
        const response = await client
            .post(`/admin/checkin/${registration1.id}/absent`)
            .withGuard('admin')
            .loginAs(admin)

        response.assertStatus(200)
        response.assertBodyContains({
            status: 'success',
            data: {
                playerId: player1.id,
                presenceStatus: 'absent',
                checkedInAt: null,
            },
        })

        // Verify in database
        await registration1.refresh()
        assert.isNull(registration1.checkedInAt)
        assert.equal(registration1.presenceStatus, 'absent')
    })

    test('DELETE /admin/checkin/:registrationId resets status to unknown', async ({ client, assert }) => {
        // First check in
        await client.post(`/admin/checkin/${registration1.id}`).withGuard('admin').loginAs(admin)

        // Then cancel
        const response = await client.delete(`/admin/checkin/${registration1.id}`).withGuard('admin').loginAs(admin)

        response.assertStatus(200)
        response.assertBodyContains({
            status: 'success',
            data: {
                playerId: player1.id,
                presenceStatus: 'unknown',
                checkedInAt: null,
            },
        })

        // Verify in database
        await registration1.refresh()
        assert.isNull(registration1.checkedInAt)
        assert.equal(registration1.presenceStatus, 'unknown')
    })

    test('check-in updates stats correctly with 3 categories', async ({ client, assert }) => {
        const today = DateTime.now().startOf('day').toISODate()

        // Check in player1 (present)
        await client.post(`/admin/checkin/${registration1.id}`).withGuard('admin').loginAs(admin)

        // Mark player2 as absent
        await client.post(`/admin/checkin/${registration2.id}/absent`).withGuard('admin').loginAs(admin)

        // Verify stats
        const response = await client.get(`/admin/checkin/${today}/players`).withGuard('admin').loginAs(admin)

        const body = response.body()
        assert.equal(body.data.stats.total, 2)
        assert.equal(body.data.stats.present, 1)
        assert.equal(body.data.stats.absent, 1)
        assert.equal(body.data.stats.unknown, 0)
    })

    test('returns 404 for non-existent registration', async ({ client }) => {
        const response = await client.post('/admin/checkin/99999').withGuard('admin').loginAs(admin)

        response.assertStatus(404)
        response.assertBodyContains({
            status: 'error',
            code: 'NOT_FOUND',
        })
    })

    test('requires admin authentication', async ({ client }) => {
        const response = await client.get('/admin/checkin/days')

        response.assertStatus(401)
    })
})

test.group('Admin Exports with Presence Filter', (group) => {
    let admin: Admin
    let tournament: Tournament
    let table: Table
    let player1: Player
    let player2: Player
    let player3: Player
    let user: User

    group.each.setup(async () => {
        admin = await Admin.updateOrCreate(
            { email: 'admin@example.com' },
            { fullName: 'Administrator', password: 'password' }
        )

        tournament = await Tournament.updateOrCreate(
            { name: 'Test Tournament' },
            {
                startDate: DateTime.now(),
                endDate: DateTime.now(),
                location: 'Test Location',
                options: Tournament.defaultOptions,
            }
        )

        table = await Table.updateOrCreate(
            { tournamentId: tournament.id, name: 'Table Export Test' },
            {
                date: DateTime.now().startOf('day'),
                startTime: '10:00',
                pointsMin: 0,
                pointsMax: 1000,
                quota: 16,
                price: 10,
                isSpecial: false,
                genderRestriction: null,
                nonNumberedOnly: false,
            }
        )

        user = await User.updateOrCreate({ email: 'user@example.com' }, { firstName: 'John', lastName: 'Doe' })

        player1 = await Player.updateOrCreate(
            { licence: '111111' },
            {
                firstName: 'Present',
                lastName: 'Player',
                club: 'Club',
                points: 800,
                sex: 'M',
                category: 'S',
            }
        )

        player2 = await Player.updateOrCreate(
            { licence: '222222' },
            {
                firstName: 'Absent',
                lastName: 'Player',
                club: 'Club',
                points: 900,
                sex: 'F',
                category: 'S',
            }
        )

        player3 = await Player.updateOrCreate(
            { licence: '333333' },
            {
                firstName: 'Unknown',
                lastName: 'Player',
                club: 'Club',
                points: 700,
                sex: 'M',
                category: 'S',
            }
        )

        // Create registrations with different presence statuses
        await Registration.updateOrCreate(
            { playerId: player1.id, tableId: table.id },
            {
                userId: user.id,
                status: 'paid',
                checkedInAt: DateTime.now(),
                presenceStatus: 'present',
            }
        )

        await Registration.updateOrCreate(
            { playerId: player2.id, tableId: table.id },
            {
                userId: user.id,
                status: 'paid',
                checkedInAt: null,
                presenceStatus: 'absent',
            }
        )

        await Registration.updateOrCreate(
            { playerId: player3.id, tableId: table.id },
            {
                userId: user.id,
                status: 'paid',
                checkedInAt: null,
                presenceStatus: 'unknown',
            }
        )
    })

    test('export includes presence columns with 3 status labels', async ({ client, assert }) => {
        const response = await client
            .post('/admin/exports/registrations')
            .json({
                tableId: table.id,
                columns: [
                    { key: 'lastName', label: 'Nom', included: true },
                    { key: 'firstName', label: 'Prénom', included: true },
                    { key: 'presence', label: 'Présence', included: true },
                    { key: 'checkedInAt', label: 'Heure', included: true },
                ],
            })
            .withGuard('admin')
            .loginAs(admin)

        response.assertStatus(200)
        response.assertHeader('content-type', 'text/csv; charset=utf-8')

        const csv = response.text()
        assert.include(csv, 'Nom')
        assert.include(csv, 'Présence')
        assert.include(csv, 'Heure')
        assert.include(csv, 'Présent')
        assert.include(csv, 'Absent')
        assert.include(csv, 'Inconnu')
    })

    test('export with presentOnly=true filters to checked-in players only', async ({ client, assert }) => {
        const response = await client
            .post('/admin/exports/registrations')
            .json({
                tableId: table.id,
                presentOnly: true,
                columns: [
                    { key: 'lastName', label: 'Nom', included: true },
                    { key: 'firstName', label: 'Prénom', included: true },
                ],
            })
            .withGuard('admin')
            .loginAs(admin)

        response.assertStatus(200)

        const csv = response.text()
        assert.include(csv, 'Present')
        assert.notInclude(csv, 'Absent;Player') // Player named Absent
        assert.notInclude(csv, 'Unknown;Player') // Player named Unknown
    })

    test('export without presentOnly includes all players', async ({ client, assert }) => {
        const response = await client
            .post('/admin/exports/registrations')
            .json({
                tableId: table.id,
                columns: [
                    { key: 'lastName', label: 'Nom', included: true },
                    { key: 'firstName', label: 'Prénom', included: true },
                ],
            })
            .withGuard('admin')
            .loginAs(admin)

        response.assertStatus(200)

        const csv = response.text()
        assert.include(csv, 'Present')
        assert.include(csv, 'Absent')
        assert.include(csv, 'Unknown')
    })
})
