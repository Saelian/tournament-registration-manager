import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'
import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'
import User from '#models/user'
import Payment from '#models/payment'
import TournamentPlayer from '#models/tournament_player'

test.group('Admin Cancel | DELETE /admin/registrations/:id', (group) => {
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
      { fullName: 'Admin', password: 'password' }
    )
  })

  group.each.teardown(async () => {
    await Registration.query().delete()
    await TournamentPlayer.query().delete()
    await Payment.query().delete()
    await Table.query().delete()
    await Player.query().delete()
    await User.query().delete()
    await Tournament.query().delete()
  })

  async function createFixtures() {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Admin Cancel Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
      location: 'Paris',
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Tableau A',
      date: tournament.startDate,
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 32,
      price: 10,
      isSpecial: false,
    })
    const user = await User.create({ email: 'player@example.com' })
    const player = await Player.create({
      userId: user.id,
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'Dupont',
      club: 'TT Club',
      points: 800,
    })
    return { admin, tournament, table, user, player }
  }

  test('returns 404 when registration does not exist', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .delete('/admin/registrations/99999')
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(404)
  })

  test('returns 400 when registration is already cancelled', async ({ client }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(400)
    response.assertBodyContains({ status: 'error' })
  })

  test('cancels a paid registration without refund', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({ status: 'success' })

    await registration.refresh()
    assert.equal(registration.status, 'cancelled')
    assert.equal(registration.cancelledByAdminId, admin.id)
    assert.equal(registration.refundStatus, 'none')
    assert.isNull(registration.refundMethod)
    assert.isNull(registration.refundedAt)
  })

  test('cancels a paid registration with refund requested', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'requested' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await registration.refresh()
    assert.equal(registration.status, 'cancelled')
    assert.equal(registration.refundStatus, 'requested')
  })

  test('cancels a paid registration with refund done (cash)', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'done', refundMethod: 'cash' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await registration.refresh()
    assert.equal(registration.status, 'cancelled')
    assert.equal(registration.refundStatus, 'done')
    assert.equal(registration.refundMethod, 'cash')
    assert.isNotNull(registration.refundedAt)
  })

  test('returns 422 when refundStatus=done but refundMethod missing', async ({ client }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'done' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('does not modify payments on single registration cancel', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 1000,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'requested' })
      .withGuard('admin')
      .loginAs(admin)

    await payment.refresh()
    assert.equal(payment.status, 'succeeded') // payment NOT modified for single cancel
  })

  test('unauthenticated request returns 401', async ({ client }) => {
    const response = await client
      .delete('/admin/registrations/1')
      .json({ refundStatus: 'none' })

    response.assertStatus(401)
  })
})

test.group('Admin Cancel | DELETE /admin/registrations/player/:playerId', (group) => {
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
      { fullName: 'Admin', password: 'password' }
    )
  })

  group.each.teardown(async () => {
    await Registration.query().delete()
    await TournamentPlayer.query().delete()
    await Payment.query().delete()
    await Table.query().delete()
    await Player.query().delete()
    await User.query().delete()
    await Tournament.query().delete()
  })

  async function createFixtures() {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Admin Cancel All Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
      location: 'Paris',
    })
    const tableA = await Table.create({
      tournamentId: tournament.id,
      name: 'Tableau A',
      date: tournament.startDate,
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 32,
      price: 10,
      isSpecial: false,
    })
    const tableB = await Table.create({
      tournamentId: tournament.id,
      name: 'Tableau B',
      date: tournament.startDate,
      startTime: '14:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 32,
      price: 10,
      isSpecial: false,
    })
    const user = await User.create({ email: 'player@example.com' })
    const player = await Player.create({
      userId: user.id,
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'Dupont',
      club: 'TT Club',
      points: 800,
    })
    return { admin, tournament, tableA, tableB, user, player }
  }

  test('returns 400 when player has no active registrations', async ({ client }) => {
    const { admin, player } = await createFixtures()

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(400)
    response.assertBodyContains({ status: 'error' })
  })

  test('cancels all active registrations without refund', async ({ client, assert }) => {
    const { admin, tableA, tableB, user, player } = await createFixtures()

    const regA = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: tableA.id,
      status: 'paid',
    })
    const regB = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: tableB.id,
      status: 'pending_payment',
    })

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await regA.refresh()
    await regB.refresh()
    assert.equal(regA.status, 'cancelled')
    assert.equal(regB.status, 'cancelled')
    assert.equal(regA.cancelledByAdminId, admin.id)
    assert.equal(regB.refundStatus, 'none')
  })

  test('cancels all and marks payments as refund_requested when refundStatus=requested', async ({
    client,
    assert,
  }) => {
    const { admin, tableA, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: tableA.id,
      status: 'paid',
    })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 1000,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'requested' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await payment.refresh()
    assert.equal(payment.status, 'refund_requested')
  })

  test('cancels all and marks payments as refunded when refundStatus=done', async ({
    client,
    assert,
  }) => {
    const { admin, tableA, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: tableA.id,
      status: 'paid',
    })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 1000,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'done', refundMethod: 'bank_transfer' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await payment.refresh()
    assert.equal(payment.status, 'refunded')
    assert.isNotNull(payment.refundedAt)
    assert.equal(payment.refundMethod, 'bank_transfer')
  })

  test('skips already-refunded payments', async ({ client, assert }) => {
    const { admin, tableA, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: tableA.id,
      status: 'paid',
    })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 1000,
      status: 'refunded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'requested' })
      .withGuard('admin')
      .loginAs(admin)

    await payment.refresh()
    assert.equal(payment.status, 'refunded') // unchanged
  })

  test('does not cancel already-cancelled registrations', async ({ client, assert }) => {
    const { admin, tableA, tableB, user, player } = await createFixtures()

    // regA is cancelled (user-initiated), regB is active
    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: tableA.id,
      status: 'cancelled',
    })
    const regB = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: tableB.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await regB.refresh()
    assert.equal(regB.status, 'cancelled')
    assert.equal(regB.cancelledByAdminId, admin.id)
  })

  test('unauthenticated request returns 401', async ({ client }) => {
    const response = await client
      .delete('/admin/registrations/player/1')
      .json({ refundStatus: 'none' })

    response.assertStatus(401)
  })
})
