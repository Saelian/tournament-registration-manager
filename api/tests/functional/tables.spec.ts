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
        price: 1000, // 10.00 EUR
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
        price: 1000,
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
        price: 1000,
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
        price: 1000,
      })

          response.assertStatus(400)
        })
    
        test('update table', async ({ client, assert }) => {    const admin = await Admin.findByOrFail('email', 'admin@example.com')
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
      price: 1000,
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
      price: 1000,
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
})
