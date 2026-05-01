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

test.group('Admin | PATCH /admin/registrations/:id/refund', (group) => {
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

  async function createFixtures() {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
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
      price: 8,
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

  test('returns 400 when registration has no pending refund', async ({ client }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .patch(`/admin/registrations/${registration.id}/refund`)
      .json({ refundMethod: 'bank_transfer' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(400)
  })

  test('returns 400 when registration is cancelled by admin but refund_status is not requested', async ({
    client,
  }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
      cancelledByAdminId: admin.id,
      refundStatus: 'none',
    })

    const response = await client
      .patch(`/admin/registrations/${registration.id}/refund`)
      .json({ refundMethod: 'cash' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(400)
  })

  test('processes partial refund and marks registration as done', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
      cancelledByAdminId: admin.id,
      refundStatus: 'requested',
    })

    const response = await client
      .patch(`/admin/registrations/${registration.id}/refund`)
      .json({ refundMethod: 'bank_transfer' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({ status: 'success' })

    await registration.refresh()
    assert.equal(registration.refundStatus, 'done')
    assert.equal(registration.refundMethod, 'bank_transfer')
    assert.isNotNull(registration.refundedAt)
  })

  test('auto-closes payment when all registrations are settled', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
      cancelledByAdminId: admin.id,
      refundStatus: 'requested',
    })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 800,
      status: 'succeeded',
      paymentMethod: 'helloasso',
    })
    await payment.related('registrations').attach([registration.id])

    await client
      .patch(`/admin/registrations/${registration.id}/refund`)
      .json({ refundMethod: 'cash' })
      .withGuard('admin')
      .loginAs(admin)

    await payment.refresh()
    assert.equal(payment.status, 'refunded')
    assert.isNotNull(payment.refundedAt)
  })

  test('does not close payment when other registrations are still active', async ({
    client,
    assert,
  }) => {
    const { admin, table, user, player } = await createFixtures()

    const regA = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
      cancelledByAdminId: admin.id,
      refundStatus: 'requested',
    })

    const tournament = await Tournament.query().firstOrFail()
    const tableB = await Table.create({
      tournamentId: tournament.id,
      name: 'Tableau B',
      date: tournament.startDate,
      startTime: '14:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 32,
      price: 8,
      isSpecial: false,
    })
    const regB = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: tableB.id,
      status: 'paid',
    })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent-2',
      amount: 1600,
      status: 'succeeded',
      paymentMethod: 'helloasso',
    })
    await payment.related('registrations').attach([regA.id, regB.id])

    await client
      .patch(`/admin/registrations/${regA.id}/refund`)
      .json({ refundMethod: 'bank_transfer' })
      .withGuard('admin')
      .loginAs(admin)

    await payment.refresh()
    assert.equal(payment.status, 'succeeded') // payment NOT closed, regB still active
  })

  test('returns 401 when unauthenticated', async ({ client }) => {
    const response = await client
      .patch('/admin/registrations/1/refund')
      .json({ refundMethod: 'cash' })

    response.assertStatus(401)
  })
})
