import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'
import Table from '#models/table'

test.group('Tables | CRUD', (group) => {
  group.each.setup(async () => {
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      {
        fullName: 'Administrator',
        password: 'password',
      }
    )
    await Table.query().delete()
    await Tournament.query().delete()
  })

  test('list tables returns empty list when no tables', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    const response = await client.get('/admin/tables').withGuard('admin').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: [],
    })
  })

  test('create table', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    const response = await client
      .post('/admin/tables')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Table 1',
        date: tournament.startDate.toISODate(),
        startTime: '10:00',
        pointsMin: 500,
        pointsMax: 1000,
        quota: 32,
        price: 10, // 10.00 EUR
        isSpecial: false,
      })

    response.assertStatus(201)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'Table 1',
        startTime: '10:00',
        pointsMin: 500,
        pointsMax: 1000,
        quota: 32,
        price: 10,
        isSpecial: false,
      },
    })

    const table = await Table.first()
    assert.isNotNull(table)
    assert.equal(table!.name, 'Table 1')
    assert.equal(table!.tournamentId, tournament.id)
  })

  test('fail to create table without tournament', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    // No tournament created

    const response = await client
      .post('/admin/tables')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Table 1',
        date: '2025-06-15',
        startTime: '10:00',
        pointsMin: 500,
        pointsMax: 1000,
        quota: 32,
        price: 10,
      })

    response.assertStatus(400) // badRequest
  })

  test('validation fails if pointsMax < pointsMin', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    const response = await client
      .post('/admin/tables')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Bad Table',
        date: '2025-06-15',
        startTime: '10:00',
        pointsMin: 1000,
        pointsMax: 500, // Invalid
        quota: 32,
        price: 10,
      })

    response.assertStatus(400)
  })

  test('update table', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Original Name',
      date: tournament.startDate,
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 32,
      price: 10,
      isSpecial: false,
    })

    const response = await client
      .put(`/admin/tables/${table.id}`)
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Updated Name',
        quota: 64,
      })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'Updated Name',
        quota: 64,
        pointsMin: 500, // Unchanged
      },
    })

    await table.refresh()
    assert.equal(table.name, 'Updated Name')
    assert.equal(table.quota, 64)
  })

  test('delete table', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'To Delete',
      date: tournament.startDate,
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 32,
      price: 10,
      isSpecial: false,
    })

    const response = await client
      .delete(`/admin/tables/${table.id}`)
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)
    
    const tableCheck = await Table.find(table.id)
    assert.isNull(tableCheck)
  })

  test('validation fails on update if pointsMax < pointsMin', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Test Table',
      date: tournament.startDate,
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 32,
      price: 10,
      isSpecial: false,
    })

    // Try to update pointsMax to be less than existing pointsMin
    const response = await client
      .put(`/admin/tables/${table.id}`)
      .withGuard('admin')
      .loginAs(admin)
      .json({
        pointsMax: 400, // Less than pointsMin (500)
      })

    response.assertStatus(400)
    response.assertBodyContains({
      status: 'error',
      code: 'BAD_REQUEST',
    })
  })

  test('validation fails on update if pointsMin > pointsMax', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Test Table',
      date: tournament.startDate,
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 32,
      price: 10,
      isSpecial: false,
    })

    // Try to update pointsMin to be greater than existing pointsMax
    const response = await client
      .put(`/admin/tables/${table.id}`)
      .withGuard('admin')
      .loginAs(admin)
      .json({
        pointsMin: 1500, // Greater than pointsMax (1000)
      })

    response.assertStatus(400)
    response.assertBodyContains({
      status: 'error',
      code: 'BAD_REQUEST',
    })
  })

  test('fail to access tables without authentication', async ({ client }) => {
    const response = await client.get('/admin/tables')
    response.assertStatus(401)
  })

  test('get single table', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Test Table',
      date: tournament.startDate,
      startTime: '14:30',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 32,
      price: 15,
      isSpecial: true,
    })

    const response = await client
      .get(`/admin/tables/${table.id}`)
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        id: table.id,
        name: 'Test Table',
        pointsMin: 500,
        pointsMax: 1000,
        quota: 32,
        price: 15,
        isSpecial: true,
        registeredCount: 0,
      },
    })
  })

  test('get non-existent table returns 404', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .get('/admin/tables/99999')
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(404)
    response.assertBodyContains({
      status: 'error',
      code: 'NOT_FOUND',
    })
  })
})

test.group('Tables | Public API', (group) => {
  group.each.setup(async () => {
    await Table.query().delete()
    await Tournament.query().delete()
  })

  test('list public tournaments', async ({ client, assert }) => {
    await Tournament.create({
      name: 'Public Tournament 1',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })
    await Tournament.create({
      name: 'Public Tournament 2',
      startDate: DateTime.now().plus({ days: 7 }),
      endDate: DateTime.now().plus({ days: 8 }),
      location: 'Lyon',
    })

    const response = await client.get('/tournaments')

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
    })

    const body = response.body()
    assert.lengthOf(body.data, 2)
    const names = body.data.map((t: { name: string }) => t.name).sort()
    assert.deepEqual(names, ['Public Tournament 1', 'Public Tournament 2'])
  })

  test('list tables for a tournament (public)', async ({ client, assert }) => {
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    await Table.create({
      tournamentId: tournament.id,
      name: 'Table A',
      date: tournament.startDate,
      startTime: '09:00',
      pointsMin: 0,
      pointsMax: 500,
      quota: 24,
      price: 8,
      isSpecial: false,
    })

    await Table.create({
      tournamentId: tournament.id,
      name: 'Table B',
      date: tournament.startDate,
      startTime: '14:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 32,
      price: 10,
      isSpecial: false,
    })

    const response = await client.get(`/tournaments/${tournament.id}/tables`)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
    })

    const body = response.body()
    assert.lengthOf(body.data, 2)
    // Tables should be ordered by date and start_time
    assert.equal(body.data[0].name, 'Table A')
    assert.equal(body.data[1].name, 'Table B')
  })

  test('list tables for non-existent tournament returns empty array', async ({ client }) => {
    const response = await client.get('/tournaments/99999/tables')

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: [],
    })
  })
})
