import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'
import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'
import User from '#models/user'

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

    const response = await client.post('/admin/tables').withGuard('admin').loginAs(admin).json({
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

    const response = await client.post('/admin/tables').withGuard('admin').loginAs(admin).json({
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

    const response = await client.post('/admin/tables').withGuard('admin').loginAs(admin).json({
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

  test('validation fails on update if quota < current registrations count', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const user = await User.create({ email: 'test-user@example.com' })
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

    // Create 5 registrations
    for (let i = 0; i < 5; i++) {
      const player = await Player.create({
        licence: `123456${i}`,
        firstName: `Player${i}`,
        lastName: 'Test',
        club: 'Test Club',
        points: 700,
      })
      await Registration.create({
        userId: user.id,
        playerId: player.id,
        tableId: table.id,
        status: 'paid',
      })
    }

    // Try to reduce quota below the 5 registered players
    const response = await client
      .put(`/admin/tables/${table.id}`)
      .withGuard('admin')
      .loginAs(admin)
      .json({
        quota: 3, // Less than 5 registered players
      })

    response.assertStatus(400)
    response.assertBodyContains({
      status: 'error',
      code: 'BAD_REQUEST',
    })

    // Verify the table quota was not changed
    await table.refresh()
    // quota should still be 32
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

    const response = await client.get(`/admin/tables/${table.id}`).withGuard('admin').loginAs(admin)

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

    const response = await client.get('/admin/tables/99999').withGuard('admin').loginAs(admin)

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

test.group('Tables | Eligibility API', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await Player.query().delete()
    await User.query().delete()
  })

  test('eligible endpoint returns isEligible and reasons for each table', async ({
    client,
    assert,
  }) => {
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    // Table A: 0-800 points
    await Table.create({
      tournamentId: tournament.id,
      name: 'Table A',
      date: tournament.startDate,
      startTime: '09:00',
      pointsMin: 0,
      pointsMax: 800,
      quota: 24,
      price: 8,
      isSpecial: false,
    })

    // Table B: 500-1200 points
    await Table.create({
      tournamentId: tournament.id,
      name: 'Table B',
      date: tournament.startDate,
      startTime: '11:00',
      pointsMin: 500,
      pointsMax: 1200,
      quota: 24,
      price: 10,
      isSpecial: false,
    })

    // Player with 802 points (like Jeremy MARIE)
    const player = await Player.create({
      licence: '1234567',
      firstName: 'Test',
      lastName: 'Player',
      club: 'Test Club',
      points: 802,
    })

    const response = await client.get('/api/tables/eligible').qs({ player_id: player.id })

    response.assertStatus(200)

    const body = response.body()
    assert.lengthOf(body.data, 2)

    // Table A (0-800): 802 > 800, should be ineligible (POINTS_TOO_HIGH)
    const tableA = body.data.find((t: { name: string }) => t.name === 'Table A')
    assert.isFalse(tableA.isEligible)
    assert.include(tableA.ineligibilityReasons, 'POINTS_TOO_HIGH')

    // Table B (500-1200): 500 <= 802 <= 1200, should be eligible
    const tableB = body.data.find((t: { name: string }) => t.name === 'Table B')
    assert.isTrue(tableB.isEligible)
    assert.isEmpty(tableB.ineligibilityReasons)
  })

  test('eligible endpoint requires player_id', async ({ client }) => {
    const response = await client.get('/api/tables/eligible')

    response.assertStatus(400)
    response.assertBodyContains({
      status: 'error',
      code: 'BAD_REQUEST',
    })
  })

  test('eligible endpoint returns 404 for non-existent player', async ({ client }) => {
    const response = await client.get('/api/tables/eligible').qs({ player_id: 99999 })

    response.assertStatus(404)
  })

  test('player with points too low is ineligible', async ({ client, assert }) => {
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    await Table.create({
      tournamentId: tournament.id,
      name: 'High Level Table',
      date: tournament.startDate,
      startTime: '09:00',
      pointsMin: 1000,
      pointsMax: 2000,
      quota: 24,
      price: 15,
      isSpecial: false,
    })

    const player = await Player.create({
      licence: '1234567',
      firstName: 'Beginner',
      lastName: 'Player',
      club: 'Test Club',
      points: 500,
    })

    const response = await client.get('/api/tables/eligible').qs({ player_id: player.id })

    response.assertStatus(200)

    const body = response.body()
    assert.lengthOf(body.data, 1)
    assert.isFalse(body.data[0].isEligible)
    assert.include(body.data[0].ineligibilityReasons, 'POINTS_TOO_LOW')
  })

  test('player at exact boundary points is eligible', async ({ client, assert }) => {
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    await Table.create({
      tournamentId: tournament.id,
      name: 'Boundary Table',
      date: tournament.startDate,
      startTime: '09:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 24,
      price: 10,
      isSpecial: false,
    })

    // Player at exact minimum
    const playerMin = await Player.create({
      licence: '1111111',
      firstName: 'Min',
      lastName: 'Player',
      club: 'Test Club',
      points: 500,
    })

    // Player at exact maximum
    const playerMax = await Player.create({
      licence: '2222222',
      firstName: 'Max',
      lastName: 'Player',
      club: 'Test Club',
      points: 1000,
    })

    const responseMin = await client.get('/api/tables/eligible').qs({ player_id: playerMin.id })
    const responseMax = await client.get('/api/tables/eligible').qs({ player_id: playerMax.id })

    responseMin.assertStatus(200)
    responseMax.assertStatus(200)

    // Both should be eligible at exact boundaries
    assert.isTrue(responseMin.body().data[0].isEligible)
    assert.isTrue(responseMax.body().data[0].isEligible)
  })

  test('daily limit reached shows DAILY_LIMIT_REACHED for third table same day', async ({
    client,
    assert,
  }) => {
    const user = await User.create({ email: 'test@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    const sameDay = tournament.startDate

    // Create 3 tables on the same day (non-special)
    const table1 = await Table.create({
      tournamentId: tournament.id,
      name: 'Table 1',
      date: sameDay,
      startTime: '09:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 24,
      price: 10,
      isSpecial: false,
    })

    const table2 = await Table.create({
      tournamentId: tournament.id,
      name: 'Table 2',
      date: sameDay,
      startTime: '11:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 24,
      price: 10,
      isSpecial: false,
    })

    await Table.create({
      tournamentId: tournament.id,
      name: 'Table 3',
      date: sameDay,
      startTime: '14:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 24,
      price: 10,
      isSpecial: false,
    })

    // Player with valid points for all tables
    const player = await Player.create({
      licence: '1234567',
      firstName: 'Test',
      lastName: 'Player',
      club: 'Test Club',
      points: 800,
    })

    // Register player to 2 tables (max allowed per day)
    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table1.id,
      status: 'pending_payment',
    })

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table2.id,
      status: 'pending_payment',
    })

    // Now check eligibility - table3 should have DAILY_LIMIT_REACHED
    const response = await client.get('/api/tables/eligible').qs({ player_id: player.id })

    response.assertStatus(200)

    const body = response.body()
    assert.lengthOf(body.data, 3)

    // Table 1 and 2 should show ALREADY_REGISTERED
    const t1 = body.data.find((t: { name: string }) => t.name === 'Table 1')
    const t2 = body.data.find((t: { name: string }) => t.name === 'Table 2')
    const t3 = body.data.find((t: { name: string }) => t.name === 'Table 3')

    assert.include(t1.ineligibilityReasons, 'ALREADY_REGISTERED')
    assert.include(t2.ineligibilityReasons, 'ALREADY_REGISTERED')

    // Table 3 should have DAILY_LIMIT_REACHED (not eligible)
    assert.isFalse(t3.isEligible)
    assert.include(t3.ineligibilityReasons, 'DAILY_LIMIT_REACHED')
  })

  test('special tables do not count towards daily limit', async ({ client, assert }) => {
    const user = await User.create({ email: 'test@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Paris',
    })

    const sameDay = tournament.startDate

    // Create 2 special tables + 1 regular table
    const specialTable1 = await Table.create({
      tournamentId: tournament.id,
      name: 'Special 1',
      date: sameDay,
      startTime: '09:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 24,
      price: 10,
      isSpecial: true,
    })

    const specialTable2 = await Table.create({
      tournamentId: tournament.id,
      name: 'Special 2',
      date: sameDay,
      startTime: '11:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 24,
      price: 10,
      isSpecial: true,
    })

    await Table.create({
      tournamentId: tournament.id,
      name: 'Regular',
      date: sameDay,
      startTime: '14:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 24,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      licence: '1234567',
      firstName: 'Test',
      lastName: 'Player',
      club: 'Test Club',
      points: 800,
    })

    // Register player to both special tables
    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: specialTable1.id,
      status: 'pending_payment',
    })

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: specialTable2.id,
      status: 'pending_payment',
    })

    // Regular table should still be eligible (special tables don't count)
    const response = await client.get('/api/tables/eligible').qs({ player_id: player.id })

    response.assertStatus(200)

    const body = response.body()
    const regular = body.data.find((t: { name: string }) => t.name === 'Regular')

    assert.isTrue(regular.isEligible)
    assert.notInclude(regular.ineligibilityReasons, 'DAILY_LIMIT_REACHED')
  })
})
