import { test } from '@japa/runner'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import TournamentPlayer from '#models/tournament_player'
import { DateTime } from 'luxon'

test.group('Bib Number Assignment', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await TournamentPlayer.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('assigns bib number on first registration', async ({ client, assert }) => {
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
    const body = response.body()
    assert.exists(body.bibNumber)
    assert.equal(body.bibNumber, 1)

    // Verify in database
    const tournamentPlayer = await TournamentPlayer.query()
      .where('tournament_id', tournament.id)
      .where('player_id', player.id)
      .firstOrFail()
    assert.equal(tournamentPlayer.bibNumber, 1)
  })

  test('keeps same bib number for multiple registrations', async ({ client, assert }) => {
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
      pointsMax: 1000,
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

    // First registration
    const response1 = await client
      .post('/api/registrations')
      .json({
        playerId: player.id,
        tableIds: [table1.id],
      })
      .loginAs(user)

    response1.assertStatus(201)
    const firstBibNumber = response1.body().bibNumber
    assert.equal(firstBibNumber, 1)

    // Second registration to different table
    const response2 = await client
      .post('/api/registrations')
      .json({
        playerId: player.id,
        tableIds: [table2.id],
      })
      .loginAs(user)

    response2.assertStatus(201)
    const secondBibNumber = response2.body().bibNumber
    assert.equal(secondBibNumber, firstBibNumber) // Same bib number
  })

  test('assigns sequential bib numbers to different players', async ({ client, assert }) => {
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

    const user1 = await User.create({ email: 'user1@example.com' })
    const player1 = await Player.create({
      userId: user1.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })

    const user2 = await User.create({ email: 'user2@example.com' })
    const player2 = await Player.create({
      userId: user2.id,
      licence: '222222',
      firstName: 'Player',
      lastName: 'Two',
      club: 'Club',
      points: 700,
    })

    // First player registers - gets bib 1
    const response1 = await client
      .post('/api/registrations')
      .json({
        playerId: player1.id,
        tableIds: [table.id],
      })
      .loginAs(user1)

    response1.assertStatus(201)
    assert.equal(response1.body().bibNumber, 1)

    // Second player registers - gets bib 2
    const response2 = await client
      .post('/api/registrations')
      .json({
        playerId: player2.id,
        tableIds: [table.id],
      })
      .loginAs(user2)

    response2.assertStatus(201)
    assert.equal(response2.body().bibNumber, 2)
  })

  test('bib number is retained after cancellation', async ({ client, assert }) => {
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

    // Register
    const registerResponse = await client
      .post('/api/registrations')
      .json({
        playerId: player.id,
        tableIds: [table.id],
      })
      .loginAs(user)

    registerResponse.assertStatus(201)
    const originalBibNumber = registerResponse.body().bibNumber
    const registrationId = registerResponse.body().registrations[0].id

    // Cancel registration
    const cancelResponse = await client.delete(`/api/registrations/${registrationId}`).loginAs(user)
    cancelResponse.assertStatus(200)

    // Verify bib number is still in database
    const tournamentPlayer = await TournamentPlayer.query()
      .where('tournament_id', tournament.id)
      .where('player_id', player.id)
      .first()

    assert.isNotNull(tournamentPlayer)
    assert.equal(tournamentPlayer!.bibNumber, originalBibNumber)
  })

  test('same bib number is returned on re-registration after cancellation', async ({ client, assert }) => {
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

    // First registration
    const response1 = await client
      .post('/api/registrations')
      .json({
        playerId: player.id,
        tableIds: [table.id],
      })
      .loginAs(user)

    const originalBibNumber = response1.body().bibNumber
    const registrationId = response1.body().registrations[0].id

    // Cancel
    await client.delete(`/api/registrations/${registrationId}`).loginAs(user)

    // Re-register
    const response2 = await client
      .post('/api/registrations')
      .json({
        playerId: player.id,
        tableIds: [table.id],
      })
      .loginAs(user)

    response2.assertStatus(201)
    assert.equal(response2.body().bibNumber, originalBibNumber)
  })

  test('bib number is not reused for new player after cancellation', async ({ client, assert }) => {
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

    const user1 = await User.create({ email: 'user1@example.com' })
    const player1 = await Player.create({
      userId: user1.id,
      licence: '111111',
      firstName: 'First',
      lastName: 'Player',
      club: 'Club',
      points: 700,
    })

    const user2 = await User.create({ email: 'user2@example.com' })
    const player2 = await Player.create({
      userId: user2.id,
      licence: '222222',
      firstName: 'Second',
      lastName: 'Player',
      club: 'Club',
      points: 700,
    })

    // First player registers and gets bib 1
    const response1 = await client
      .post('/api/registrations')
      .json({
        playerId: player1.id,
        tableIds: [table.id],
      })
      .loginAs(user1)

    const registrationId = response1.body().registrations[0].id
    assert.equal(response1.body().bibNumber, 1)

    // First player cancels
    await client.delete(`/api/registrations/${registrationId}`).loginAs(user1)

    // Second player registers - should get bib 2, NOT bib 1
    const response2 = await client
      .post('/api/registrations')
      .json({
        playerId: player2.id,
        tableIds: [table.id],
      })
      .loginAs(user2)

    response2.assertStatus(201)
    assert.equal(response2.body().bibNumber, 2)
  })

  test('bib number is included in myRegistrations response', async ({ client, assert }) => {
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

    // Create registration
    await client
      .post('/api/registrations')
      .json({
        playerId: player.id,
        tableIds: [table.id],
      })
      .loginAs(user)

    // Get my registrations
    const response = await client.get('/api/me/registrations').loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body)
    assert.lengthOf(body, 1)
    assert.exists(body[0].bibNumber)
    assert.equal(body[0].bibNumber, 1)
  })

  test('bib number is included in show registration response', async ({ client, assert }) => {
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

    // Create registration
    const createResponse = await client
      .post('/api/registrations')
      .json({
        playerId: player.id,
        tableIds: [table.id],
      })
      .loginAs(user)

    const registrationId = createResponse.body().registrations[0].id

    // Get single registration
    const response = await client.get(`/api/registrations/${registrationId}`).loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.bibNumber)
    assert.equal(body.bibNumber, 1)
  })
})
