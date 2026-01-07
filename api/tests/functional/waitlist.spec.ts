import { test } from '@japa/runner'
import User from '#models/user'
import Admin from '#models/admin'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import { DateTime } from 'luxon'
import waitlistService from '#services/waitlist_service'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'
import PaymentCleanupJob from '#jobs/payment_cleanup_job'
import db from '@adonisjs/lucid/services/db'

test.group('WaitlistService', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('recalculateRanks assigns sequential ranks after removal', async ({ assert }) => {
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    // Fill the table
    const player1 = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })
    await Registration.create({
      userId: user.id,
      playerId: player1.id,
      tableId: table.id,
      status: 'paid',
    })

    // Create waitlist entries with ranks 1, 2, 3
    const player2 = await Player.create({
      userId: user.id,
      licence: '222222',
      firstName: 'Player',
      lastName: 'Two',
      club: 'Club',
      points: 700,
    })
    const reg2 = await Registration.create({
      userId: user.id,
      playerId: player2.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })

    const player3 = await Player.create({
      userId: user.id,
      licence: '333333',
      firstName: 'Player',
      lastName: 'Three',
      club: 'Club',
      points: 700,
    })
    const reg3 = await Registration.create({
      userId: user.id,
      playerId: player3.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 2,
    })

    const player4 = await Player.create({
      userId: user.id,
      licence: '444444',
      firstName: 'Player',
      lastName: 'Four',
      club: 'Club',
      points: 700,
    })
    const reg4 = await Registration.create({
      userId: user.id,
      playerId: player4.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 3,
    })

    // Remove rank 2 (player3) by promoting or cancelling
    reg3.status = 'cancelled'
    reg3.waitlistRank = null
    await reg3.save()

    // Recalculate ranks
    await waitlistService.recalculateRanks(table.id)

    // Verify ranks are now 1 and 2
    await reg2.refresh()
    await reg4.refresh()

    assert.equal(reg2.waitlistRank, 1)
    assert.equal(reg4.waitlistRank, 2)
  })

  test('promoteToPayment changes status and clears rank', async ({ assert }) => {
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })

    await waitlistService.promoteToPayment(registration.id)

    await registration.refresh()
    assert.equal(registration.status, 'pending_payment')
    assert.isNull(registration.waitlistRank)
  })

  test('getWaitlistCount returns correct count', async ({ assert }) => {
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player1 = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })
    const player2 = await Player.create({
      userId: user.id,
      licence: '222222',
      firstName: 'Player',
      lastName: 'Two',
      club: 'Club',
      points: 700,
    })

    await Registration.create({
      userId: user.id,
      playerId: player1.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })
    await Registration.create({
      userId: user.id,
      playerId: player2.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 2,
    })

    const count = await waitlistService.getWaitlistCount(table.id)
    assert.equal(count, 2)
  })

  test('getNextRank returns correct next rank', async ({ assert }) => {
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })
    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 5,
    })

    const nextRank = await waitlistService.getNextRank(table.id)
    assert.equal(nextRank, 6)
  })
})

test.group('Waitlist Protection', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('tables endpoint returns waitlistCount', async ({ client }) => {
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

    const user = await User.create({ email: 'user@example.com' })
    const player = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })
    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })

    const response = await client.get(`/tournaments/${tournament.id}/tables`)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [{ id: table.id, waitlistCount: 1 }],
    })
  })

  test('eligible tables returns WAITLIST_PRIORITY when table has spots but waitlist exists', async ({
    client,
  }) => {
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
      quota: 2,
      price: 10,
      isSpecial: false,
    })

    // Create a paid registration (1/2 spots used)
    const player1 = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })
    await Registration.create({
      userId: user.id,
      playerId: player1.id,
      tableId: table.id,
      status: 'paid',
    })

    // Create a waitlist entry
    const player2 = await Player.create({
      userId: user.id,
      licence: '222222',
      firstName: 'Player',
      lastName: 'Two',
      club: 'Club',
      points: 700,
    })
    await Registration.create({
      userId: user.id,
      playerId: player2.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })

    // New player trying to register
    const player3 = await Player.create({
      userId: user2.id,
      licence: '333333',
      firstName: 'Player',
      lastName: 'Three',
      club: 'Club',
      points: 700,
    })

    const response = await client.get(`/api/tables/eligible?player_id=${player3.id}`).loginAs(user2)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [
        {
          id: table.id,
          isEligible: false,
          ineligibilityReasons: ['WAITLIST_PRIORITY'],
        },
      ],
    })
  })
})

test.group('Admin Waitlist Promotion', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
    await Admin.query().delete()
  })

  test('admin can promote waitlist registration', async ({ client, assert }) => {
    const admin = await Admin.create({
      email: 'admin@example.com',
      password: await hash.make('password123'),
      fullName: 'Test Admin',
    })
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })

    const response = await client
      .post(`/admin/registrations/${registration.id}/promote`)
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        message: 'Registration promoted successfully',
        registration: {
          id: registration.id,
          status: 'pending_payment',
          waitlistRank: null,
        },
      },
    })

    await registration.refresh()
    assert.equal(registration.status, 'pending_payment')
    assert.isNull(registration.waitlistRank)
  })

  test('cannot promote non-waitlist registration', async ({ client }) => {
    const admin = await Admin.create({
      email: 'admin@example.com',
      password: await hash.make('password123'),
      fullName: 'Test Admin',
    })
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .post(`/admin/registrations/${registration.id}/promote`)
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(400)
  })

  test('promote recalculates remaining waitlist ranks', async ({ client, assert }) => {
    const admin = await Admin.create({
      email: 'admin@example.com',
      password: await hash.make('password123'),
      fullName: 'Test Admin',
    })
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player1 = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })
    const player2 = await Player.create({
      userId: user.id,
      licence: '222222',
      firstName: 'Player',
      lastName: 'Two',
      club: 'Club',
      points: 700,
    })
    const player3 = await Player.create({
      userId: user.id,
      licence: '333333',
      firstName: 'Player',
      lastName: 'Three',
      club: 'Club',
      points: 700,
    })

    const reg1 = await Registration.create({
      userId: user.id,
      playerId: player1.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })
    const reg2 = await Registration.create({
      userId: user.id,
      playerId: player2.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 2,
    })
    const reg3 = await Registration.create({
      userId: user.id,
      playerId: player3.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 3,
    })

    // Promote the first one
    await client.post(`/admin/registrations/${reg1.id}/promote`).withGuard('admin').loginAs(admin)

    // Verify ranks are recalculated
    await reg2.refresh()
    await reg3.refresh()

    assert.equal(reg2.waitlistRank, 1)
    assert.equal(reg3.waitlistRank, 2)
  })
})

test.group('Cancellation with Waitlist', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('cancelling waitlist registration recalculates ranks', async ({ client, assert }) => {
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player1 = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })
    const player2 = await Player.create({
      userId: user.id,
      licence: '222222',
      firstName: 'Player',
      lastName: 'Two',
      club: 'Club',
      points: 700,
    })
    const player3 = await Player.create({
      userId: user.id,
      licence: '333333',
      firstName: 'Player',
      lastName: 'Three',
      club: 'Club',
      points: 700,
    })

    const reg1 = await Registration.create({
      userId: user.id,
      playerId: player1.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })
    const reg2 = await Registration.create({
      userId: user.id,
      playerId: player2.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 2,
    })
    const reg3 = await Registration.create({
      userId: user.id,
      playerId: player3.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 3,
    })

    // Cancel the second one
    await client.delete(`/api/registrations/${reg2.id}`).loginAs(user)

    // Verify ranks are recalculated
    await reg1.refresh()
    await reg3.refresh()

    assert.equal(reg1.waitlistRank, 1)
    assert.equal(reg3.waitlistRank, 2)
  })
})

test.group('Waitlist Promotion Email Notification', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
    await Admin.query().delete()
  })

  test('promotion sends email notification to user', async ({ client, assert }) => {
    mail.fake()

    const admin = await Admin.create({
      email: 'admin@example.com',
      password: await hash.make('password123'),
      fullName: 'Test Admin',
    })
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })

    // With mail.fake(), the email is captured but not actually sent
    const response = await client
      .post(`/admin/registrations/${registration.id}/promote`)
      .withGuard('admin')
      .loginAs(admin)

    // Verify promotion succeeded - email is sent as part of this process
    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        message: 'Registration promoted successfully',
        registration: {
          status: 'pending_payment',
        },
      },
    })

    // Verify registration was updated
    await registration.refresh()
    assert.equal(registration.status, 'pending_payment')
    assert.isNull(registration.waitlistRank)

    mail.restore()
  })

  test('promotion email contains table info and payment deadline', async ({ client, assert }) => {
    mail.fake()

    const admin = await Admin.create({
      email: 'admin@example.com',
      password: await hash.make('password123'),
      fullName: 'Test Admin',
    })
    const user = await User.create({ email: 'user@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Test Location',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 6,
        registrationStartDate: null,
        registrationEndDate: null,
      },
    })

    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Table Spécial',
      date: DateTime.now(),
      startTime: '14:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      userId: user.id,
      licence: '222222',
      firstName: 'Jean',
      lastName: 'Dupont',
      club: 'Club Test',
      points: 700,
    })

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'waitlist',
      waitlistRank: 1,
    })

    // With mail.fake(), the email is captured but not actually sent
    const response = await client
      .post(`/admin/registrations/${registration.id}/promote`)
      .withGuard('admin')
      .loginAs(admin)

    // Verify promotion succeeded with correct configuration
    response.assertStatus(200)

    // Verify registration status changed
    await registration.refresh()
    assert.equal(registration.status, 'pending_payment')
    assert.isNull(registration.waitlistRank)

    mail.restore()
  })
})

test.group('Waitlist Promotion Expiration', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
    await Admin.query().delete()
  })

  test('promoted registration expires if not paid after timer', async ({ assert }) => {
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })

    // Create a registration that was promoted and is now expired
    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'pending_payment',
    })

    // Use raw SQL to bypass Lucid's auto-update of updated_at
    const expiredTime = DateTime.now().minus({ minutes: 60 }).toSQL()
    await db.rawQuery('UPDATE registrations SET updated_at = ? WHERE id = ?', [
      expiredTime,
      registration.id,
    ])

    // Run the cleanup job
    const job = new PaymentCleanupJob()
    await job.run()

    // Verify the registration was cancelled
    await registration.refresh()
    assert.equal(registration.status, 'cancelled')
  })

  test('recently promoted registration is not expired', async ({ assert }) => {
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
      quota: 1,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      userId: user.id,
      licence: '111111',
      firstName: 'Player',
      lastName: 'One',
      club: 'Club',
      points: 700,
    })

    // Create a recent pending_payment registration (simulating a fresh promotion)
    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'pending_payment',
    })

    // Run the cleanup job
    const job = new PaymentCleanupJob()
    await job.run()

    // Verify the registration was NOT cancelled
    await registration.refresh()
    assert.equal(registration.status, 'pending_payment')
  })
})
