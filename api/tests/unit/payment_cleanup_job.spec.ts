import { test } from '@japa/runner'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import Payment from '#models/payment'
import PaymentCleanupJob from '#jobs/payment_cleanup_job'
import { DateTime } from 'luxon'

test.group('PaymentCleanupJob', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('should cancel expired pending_payment registrations', async ({ assert }) => {
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

    const expiredRegistration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'pending_payment',
    })

    await expiredRegistration
      .merge({
        createdAt: DateTime.now().minus({ minutes: 60 }),
      })
      .save()

    const job = new PaymentCleanupJob()
    await job.run()

    await expiredRegistration.refresh()
    assert.equal(expiredRegistration.status, 'cancelled')
  })

  test('should not cancel recent pending_payment registrations', async ({ assert }) => {
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

    const recentRegistration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'pending_payment',
    })

    const job = new PaymentCleanupJob()
    await job.run()

    await recentRegistration.refresh()
    assert.equal(recentRegistration.status, 'pending_payment')
  })

  test('should expire pending payments linked to expired registrations', async ({ assert }) => {
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

    const expiredRegistration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'pending_payment',
    })

    await expiredRegistration
      .merge({
        createdAt: DateTime.now().minus({ minutes: 60 }),
      })
      .save()

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-checkout-intent-123',
      amount: 1000,
      status: 'pending',
    })

    await payment.related('registrations').attach([expiredRegistration.id])

    const job = new PaymentCleanupJob()
    await job.run()

    await payment.refresh()
    assert.equal(payment.status, 'expired')
  })

  test('should not affect paid registrations', async ({ assert }) => {
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

    const paidRegistration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    await paidRegistration
      .merge({
        createdAt: DateTime.now().minus({ minutes: 60 }),
      })
      .save()

    const job = new PaymentCleanupJob()
    await job.run()

    await paidRegistration.refresh()
    assert.equal(paidRegistration.status, 'paid')
  })
})
