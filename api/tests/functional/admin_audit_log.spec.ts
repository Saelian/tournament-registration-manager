import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'
import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'
import User from '#models/user'
import Payment from '#models/payment'

test.group('Admin Audit Log | GET /admin/audit-log', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Table.query().delete()
    await Player.query().delete()
    await User.query().delete()
    await Tournament.query().delete()
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      { fullName: 'Admin Test', password: 'password' }
    )
  })

  group.each.teardown(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Table.query().delete()
    await Player.query().delete()
    await User.query().delete()
    await Tournament.query().delete()
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
      pointsMin: 0,
      pointsMax: 2000,
      quota: 32,
      price: 12,
      isSpecial: false,
    })
    const user = await User.create({ email: 'player@example.com' })
    const player = await Player.create({
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'Dupont',
      club: 'TT Club',
      points: 800,
    })
    return { admin, tournament, table, user, player }
  }

  test('retourne 401 sans authentification', async ({ client }) => {
    const response = await client.get('/admin/audit-log')
    response.assertStatus(401)
  })

  test('retourne un tableau vide sans données', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)
    response.assertBodyContains({ status: 'success', data: { events: [] } })
  })

  test('retourne un événement inscription_utilisateur pour inscription user', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      isAdminCreated: false,
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string; playerName: string; tableName: string }>
    const evt = events.find((e) => e.type === 'inscription_utilisateur')
    assert.exists(evt, 'inscription_utilisateur event missing')
    assert.equal(evt!.playerName, 'Jean Dupont')
    assert.equal(evt!.tableName, 'Tableau A')
  })

  test('retourne un événement inscription_admin pour inscription admin', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      isAdminCreated: true,
      adminId: admin.id,
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string; actor: string }>
    const evt = events.find((e) => e.type === 'inscription_admin')
    assert.exists(evt, 'inscription_admin event missing')
    assert.equal(evt!.actor, 'Admin Test')
  })

  test('retourne un événement pointage quand checkedInAt est défini', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      checkedInAt: DateTime.now(),
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string }>
    assert.exists(events.find((e) => e.type === 'pointage'), 'pointage event missing')
  })

  test('retourne un événement promotion_liste_attente quand promotedAt est défini', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      promotedAt: DateTime.now(),
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string }>
    assert.exists(events.find((e) => e.type === 'promotion_liste_attente'), 'promotion_liste_attente event missing')
  })

  test('retourne un événement annulation_admin quand cancelledByAdminId est défini', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
      cancelledByAdminId: admin.id,
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string; actor: string }>
    const evt = events.find((e) => e.type === 'annulation_admin')
    assert.exists(evt, 'annulation_admin event missing')
    assert.equal(evt!.actor, 'Admin Test')
  })

  test('retourne un événement paiement_confirme pour un paiement succeeded', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: `test-checkout-${Date.now()}`,
      amount: 1200,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string; actor: string; details: string }>
    const evt = events.find((e) => e.type === 'paiement_confirme')
    assert.exists(evt, 'paiement_confirme event missing')
    assert.equal(evt!.actor, 'Espèces')
    assert.isTrue(evt!.details.includes('12,00 €'), `details should contain amount, got: ${evt!.details}`)
  })

  test('retourne un événement remboursement quand refundedAt est défini', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: `test-checkout-${Date.now()}`,
      amount: 1200,
      status: 'refunded',
      paymentMethod: 'helloasso',
      refundedAt: DateTime.now(),
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string }>
    assert.exists(events.find((e) => e.type === 'remboursement'), 'remboursement event missing')
  })

  test('filtre les événements par playerId', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const user2 = await User.create({ email: 'player2@example.com' })
    const player2 = await Player.create({
      licence: '9999999',
      firstName: 'Marie',
      lastName: 'Martin',
      club: 'TT Club',
      points: 600,
    })

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })
    await Registration.create({
      userId: user2.id,
      playerId: player2.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .get('/admin/audit-log')
      .qs({ playerId: player.id })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)
    const events = response.body().data.events as Array<{ playerId: number }>
    assert.isTrue(events.every((e) => e.playerId === player.id), 'all events should be for player1')
    assert.equal(events.length, 1)
  })

  test('retourne les événements triés par timestamp desc', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      checkedInAt: DateTime.now(),
    })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: `test-checkout-sort-${Date.now()}`,
      amount: 1200,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ timestamp: string }>
    assert.isAbove(events.length, 1, 'should have multiple events')

    for (let i = 0; i < events.length - 1; i++) {
      assert.isAtLeast(
        events[i].timestamp.localeCompare(events[i + 1].timestamp),
        0,
        `event[${i}] should not be before event[${i + 1}]`
      )
    }
  })
})
