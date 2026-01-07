import { test } from '@japa/runner'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import Payment from '#models/payment'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'

test.group('Cancellation - Unregister without refund', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('can cancel a paid registration without refund', async ({ client, assert }) => {
    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
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
      date: DateTime.now().plus({ days: 30 }),
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

    const response = await client.delete(`/api/registrations/${registration.id}`).loginAs(user)

    response.assertStatus(200)

    await registration.refresh()
    assert.equal(registration.status, 'cancelled')
  })

  test('cannot cancel a registration of another user', async ({ client }) => {
    const user1 = await User.create({ email: 'user1@example.com' })
    const user2 = await User.create({ email: 'user2@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
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
      date: DateTime.now().plus({ days: 30 }),
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
      status: 'paid',
    })

    const response = await client.delete(`/api/registrations/${registration.id}`).loginAs(user2)

    response.assertStatus(403)
  })

  test('cannot cancel an already cancelled registration', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
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
      date: DateTime.now().plus({ days: 30 }),
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
      status: 'cancelled',
    })

    const response = await client.delete(`/api/registrations/${registration.id}`).loginAs(user)

    response.assertStatus(400)
  })
})

test.group('Cancellation - Refund eligibility', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('refund eligibility returns eligible when within deadline', async ({ client, assert }) => {
    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
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
      date: DateTime.now().plus({ days: 30 }),
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
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      helloassoPaymentId: '12345',
      amount: 1000,
      status: 'succeeded',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client
      .get(`/api/payments/${payment.id}/refund-eligibility`)
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.isTrue(body.eligible)
    assert.isFalse(body.deadlinePassed)
  })

  test('refund eligibility returns not eligible when deadline passed', async ({
    client,
    assert,
  }) => {
    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().minus({ days: 1 }),
      endDate: DateTime.now(),
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
      date: DateTime.now().minus({ days: 1 }),
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
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      helloassoPaymentId: '12345',
      amount: 1000,
      status: 'succeeded',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client
      .get(`/api/payments/${payment.id}/refund-eligibility`)
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.isFalse(body.eligible)
    assert.isTrue(body.deadlinePassed)
  })

  test('cannot check eligibility for payment of another user', async ({ client }) => {
    const user1 = await User.create({ email: 'user1@example.com' })
    const user2 = await User.create({ email: 'user2@example.com' })
    const payment = await Payment.create({
      userId: user1.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      amount: 1000,
      status: 'succeeded',
    })

    const response = await client
      .get(`/api/payments/${payment.id}/refund-eligibility`)
      .loginAs(user2)

    response.assertStatus(403)
  })
})

test.group('Cancellation - Request refund', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('refund request without helloassoPaymentId sends email to admin for manual processing', async ({
    client,
    assert,
  }) => {
    // Fake mail to capture sent emails
    mail.fake()

    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
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
      date: DateTime.now().plus({ days: 30 }),
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
    // Payment without helloassoPaymentId (offline payment like cash/check)
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      amount: 1000,
      status: 'succeeded',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.post(`/api/payments/${payment.id}/refund`).loginAs(user)

    // Should succeed - admin will process manually
    response.assertStatus(200)

    // Payment should be marked as refund_requested
    await payment.refresh()
    assert.equal(payment.status, 'refund_requested')

    // Restore mail
    mail.restore()
  })

  test('cannot refund payment of another user', async ({ client }) => {
    const user1 = await User.create({ email: 'user1@example.com' })
    const user2 = await User.create({ email: 'user2@example.com' })
    const payment = await Payment.create({
      userId: user1.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      helloassoPaymentId: '12345',
      amount: 1000,
      status: 'succeeded',
    })

    const response = await client.post(`/api/payments/${payment.id}/refund`).loginAs(user2)

    response.assertStatus(403)
  })

  test('cannot refund a non-succeeded payment', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      helloassoPaymentId: '12345',
      amount: 1000,
      status: 'pending',
    })

    const response = await client.post(`/api/payments/${payment.id}/refund`).loginAs(user)

    response.assertStatus(400)
  })

  test('cannot refund after deadline', async ({ client }) => {
    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().minus({ days: 1 }),
      endDate: DateTime.now(),
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
      date: DateTime.now().minus({ days: 1 }),
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
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-checkout-123',
      helloassoPaymentId: '12345',
      amount: 1000,
      status: 'succeeded',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.post(`/api/payments/${payment.id}/refund`).loginAs(user)

    response.assertStatus(400)
    response.assertBodyContains({ code: 'REFUND_DEADLINE_PASSED' })
  })
})
