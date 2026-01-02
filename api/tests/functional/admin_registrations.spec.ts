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

  test('returns registrations with player, table, subscriber and payment info', async ({
    client,
    assert,
  }) => {
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

    const response = await client
      .get(`/admin/tables/${table1.id}/registrations`)
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.status, 'success')
    assert.lengthOf(body.data.registrations, 1)
    assert.equal(body.data.registrations[0].player.licence, '1111111')
    assert.equal(body.data.table.name, 'Table 1')
  })

  test('returns 404 for non-existent table', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .get('/admin/tables/99999/registrations')
      .withGuard('admin')
      .loginAs(admin)

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

    const response = await client
      .get(`/admin/tables/${table.id}/registrations`)
      .withGuard('admin')
      .loginAs(admin)

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
