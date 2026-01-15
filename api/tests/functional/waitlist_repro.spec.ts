import { test } from '@japa/runner'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import { DateTime } from 'luxon'

test.group('Waitlist Bypass Reproduction', (group) => {
    group.each.setup(async () => {
        await Registration.query().delete()
        await Player.query().delete()
        await Table.query().delete()
        await Tournament.query().delete()
        await User.query().delete()
    })

    test('new registration goes to waitlist if waitlist exists even if payment is pending/cancelled', async ({
        client,
        assert,
    }) => {
        const user = await User.create({ email: 'user@example.com' })
        const user2 = await User.create({ email: 'user2@example.com' }) // For the new registrant

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
            quota: 1, // Only 1 spot
            price: 10,
            isSpecial: false,
        })

        // 1. Fill the table with Player A
        const playerA = await Player.create({
            userId: user.id,
            licence: '111111',
            firstName: 'Player',
            lastName: 'A',
            club: 'Club',
            points: 700,
        })
        await Registration.create({
            userId: user.id,
            playerId: playerA.id,
            tableId: table.id,
            status: 'paid',
        })

        // 2. Add Player B to Waitlist (Rank 1)
        const playerB = await Player.create({
            userId: user.id,
            licence: '222222',
            firstName: 'Player',
            lastName: 'B',
            club: 'Club',
            points: 700,
        })
        await Registration.create({
            userId: user.id,
            playerId: playerB.id,
            tableId: table.id,
            status: 'waitlist',
            waitlistRank: 1,
        })

        // 3. Cancel Player A (Spot opens up)
        // Note: cancellationService would normally be used, but direct DB manipulation is fine for setup
        const regA = await Registration.findByOrFail('player_id', playerA.id)
        regA.status = 'cancelled'
        await regA.save()

        // 4. Try to register Player C
        // Expectation: Should go to Waitlist Rank 2 because Player B is waiting
        // Current Bug: Goes to Pending Payment (Rank null) because activeCount (0) < quota (1)
        const playerC = await Player.create({
            userId: user2.id,
            licence: '333333',
            firstName: 'Player',
            lastName: 'C',
            club: 'Club',
            points: 700,
        })

        const response = await client
            .post('/api/registrations')
            .json({
                playerId: playerC.id,
                tableIds: [table.id],
                initiatePayment: true,
            })
            .loginAs(user2)

        response.assertStatus(201)
        const registrations = response.body().registrations
        const regC = registrations[0]

        // This assertion is expected to FAIL until we fix the bug
        assert.equal(regC.status, 'waitlist', 'New user should be on waitlist because waitlist exists')
        assert.equal(regC.waitlistRank, 2, 'New user should be rank 2')
    })
})
