import { test } from '@japa/runner'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Admin from '#models/admin'
import { DateTime } from 'luxon'

test.group('Tables Repro', (group) => {
  let admin: Admin

  group.setup(async () => {
    // Ensure we have a tournament
    await Tournament.updateOrCreate({ id: 1 }, {
        name: 'Test Tournament',
        startDate: DateTime.now(),
        endDate: DateTime.now().plus({ days: 1 }),
        location: 'Paris',
        options: { refundDeadline: null, waitlistTimerHours: 4, registrationStartDate: null, registrationEndDate: null }
    })

    admin = await Admin.create({
      email: 'admin@test.com',
      password: 'password',
      fullName: 'Test Admin',
    })
  })

  group.teardown(async () => {
    // cleanup
    await Table.query().delete()
    await Admin.query().delete()
  })

  test('create table fails', async ({ client }) => {
    const response = await client.post('/admin/tables')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Table Repro',
        date: '2025-06-15',
        startTime: '10:00',
        pointsMin: 500,
        pointsMax: 1000,
        quota: 24,
        price: 10,
        isSpecial: false,
        // Also add the new fields I added to validation
        prizes: [],
        sponsorIds: []
      })

    console.log('Response body:', response.body())
    response.assertStatus(201)
  })
})
