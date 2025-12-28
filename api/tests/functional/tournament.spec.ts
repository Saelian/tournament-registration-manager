import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'

test.group('Tournament | Configuration', (group) => {
  group.each.setup(async () => {
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      {
        fullName: 'Administrator',
        password: 'password',
      }
    )
    await Tournament.query().delete()
  })

  test('get tournament returns 404 when not configured', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client.get('/admin/tournament').withGuard('admin').loginAs(admin)

    response.assertStatus(404)
    response.assertBodyContains({
      status: 'error',
      code: 'NOT_FOUND',
    })
  })

  test('create tournament configuration via PUT', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Test Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: { waitlistTimerHours: 6 },
      })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'Test Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: { waitlistTimerHours: 6 },
      },
    })

    const tournament = await Tournament.first()
    assert.isNotNull(tournament)
    assert.equal(tournament!.name, 'Test Tournament')
  })

  test('update existing tournament configuration', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    await Tournament.create({
      name: 'Initial Tournament',
      startDate: DateTime.fromISO('2025-06-15'),
      endDate: DateTime.fromISO('2025-06-16'),
      location: 'Lyon',
      options: { refundDeadline: null, waitlistTimerHours: 4 },
    })

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Updated Tournament',
        startDate: '2025-07-01',
        endDate: '2025-07-02',
        location: 'Marseille',
        options: {
          refundDeadline: '2025-06-25',
          waitlistTimerHours: 8,
        },
      })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'Updated Tournament',
        startDate: '2025-07-01',
        endDate: '2025-07-02',
        location: 'Marseille',
        options: {
          refundDeadline: '2025-06-25',
          waitlistTimerHours: 8,
        },
      },
    })
  })

  test('get tournament returns configuration when exists', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    await Tournament.create({
      name: 'My Tournament',
      startDate: DateTime.fromISO('2025-06-15'),
      endDate: DateTime.fromISO('2025-06-16'),
      location: 'Nice',
      options: { refundDeadline: null, waitlistTimerHours: 4 },
    })

    const response = await client.get('/admin/tournament').withGuard('admin').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'My Tournament',
        location: 'Nice',
      },
    })
  })

  test('fail with invalid dates (end before start)', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Test Tournament',
        startDate: '2025-06-20',
        endDate: '2025-06-15',
        location: 'Paris',
      })

    response.assertStatus(422)
  })

  test('default waitlist timer is 4 hours', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Test Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
      })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        options: {
          waitlistTimerHours: 4,
        },
      },
    })

    const tournament = await Tournament.first()
    assert.equal(tournament!.options.waitlistTimerHours, 4)
  })

  test('fail to access without authentication', async ({ client }) => {
    const response = await client.get('/admin/tournament')
    response.assertStatus(401)
  })
})
