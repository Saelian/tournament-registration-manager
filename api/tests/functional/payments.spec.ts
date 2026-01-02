import { test } from '@japa/runner'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import Payment from '#models/payment'
import { DateTime } from 'luxon'

test.group('Payments Controller', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('create-intent returns error when registrationIds is missing', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })

    const response = await client.post('/api/payments/create-intent').json({}).loginAs(user)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Invalid payload: registrationIds (non-empty array) is required',
    })
  })

  test('create-intent returns error when registrationIds is empty', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })

    const response = await client
      .post('/api/payments/create-intent')
      .json({ registrationIds: [] })
      .loginAs(user)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Invalid payload: registrationIds (non-empty array) is required',
    })
  })

  test('create-intent returns error when registration not found', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })

    const response = await client
      .post('/api/payments/create-intent')
      .json({ registrationIds: [99999] })
      .loginAs(user)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'One or more registrations not found, not owned by you, or not pending payment',
    })
  })

  test('create-intent returns error when registration belongs to another user', async ({
    client,
  }) => {
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

    const response = await client
      .post('/api/payments/create-intent')
      .json({ registrationIds: [registration.id] })
      .loginAs(user2)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'One or more registrations not found, not owned by you, or not pending payment',
    })
  })

  test('create-intent returns error when registration is already paid', async ({ client }) => {
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
      status: 'paid',
    })

    const response = await client
      .post('/api/payments/create-intent')
      .json({ registrationIds: [registration.id] })
      .loginAs(user)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'One or more registrations not found, not owned by you, or not pending payment',
    })
  })

  test('show returns 404 for non-existent payment', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })

    const response = await client.get('/api/payments/99999').loginAs(user)

    response.assertStatus(404)
  })

  test('show returns 404 for payment belonging to another user', async ({ client }) => {
    const user1 = await User.create({ email: 'user1@example.com' })
    const user2 = await User.create({ email: 'user2@example.com' })

    const payment = await Payment.create({
      userId: user1.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      amount: 1000,
      status: 'pending',
    })

    const response = await client.get(`/api/payments/${payment.id}`).loginAs(user2)

    response.assertStatus(404)
  })

  test('show returns payment with registrations', async ({ client }) => {
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

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      amount: 1000,
      status: 'pending',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.get(`/api/payments/${payment.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      id: payment.id,
      status: 'pending',
      amount: 1000,
      registrations: [{ id: registration.id }],
    })
  })

  test('myPayments returns empty list when user has no payments', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })

    const response = await client.get('/api/me/payments').loginAs(user)

    response.assertStatus(200)
    response.assertBody([])
  })

  test('myPayments returns user payments', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      amount: 1000,
      status: 'pending',
    })

    const response = await client.get('/api/me/payments').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains([{ id: payment.id, status: 'pending' }])
  })
})
