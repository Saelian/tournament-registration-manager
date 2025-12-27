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

  test('list registrations returns user registrations', async ({ client, assert }) => {
    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Test Location',
      waitlistTimerHours: 4,
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
    response.assertBodyContains([{
      id: registration.id,
      status: 'pending_payment',
      table: {
        id: table.id,
        name: 'Table A',
        tournament: {
          id: tournament.id,
          name: 'Test Tournament',
        }
      },
      player: {
        id: player.id,
        firstName: 'John',
      }
    }])
  })

  test('cancel registration changes status to cancelled', async ({ client, assert }) => {
    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
        name: 'Test Tournament',
        startDate: DateTime.now(),
        endDate: DateTime.now().plus({ days: 1 }),
        location: 'Test Location',
        waitlistTimerHours: 4,
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
        waitlistTimerHours: 4,
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
