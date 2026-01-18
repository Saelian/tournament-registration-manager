import { test } from '@japa/runner'
import User from '#models/user'
import OtpToken from '#models/otp_token'
import Player from '#models/player'
import Table from '#models/table'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'

test.group('Auth | OTP Flow', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('request otp creates user and token', async ({ client, assert }) => {
    mail.fake()

    const email = 'newuser@example.com'

    const response = await client.post('/auth/request-otp').json({ email })

    response.assertStatus(200)

    const user = await User.findBy('email', email)
    assert.exists(user)

    if (user) {
      const token = await OtpToken.findBy('user_id', user.id)
      assert.exists(token)
      assert.isTrue(token!.code.length === 6)
      assert.match(token!.code, /^\d{6}$/)
    }

    mail.restore()
  })

  test('verify otp logs in user', async ({ client }) => {
    const email = 'existing@example.com'
    const user = await User.create({ email })
    const code = '123456'
    await OtpToken.create({
      userId: user.id,
      code,
      expiresAt: DateTime.now().plus({ minutes: 10 }),
    })

    const response = await client.post('/auth/verify-otp').json({ email, code })

    response.assertStatus(200)
    response.assertBodyContains({ user: { email } })
  })

  test('verify otp with invalid code fails', async ({ client }) => {
    const email = 'test@example.com'
    const user = await User.create({ email })
    await OtpToken.create({
      userId: user.id,
      code: '123456',
      expiresAt: DateTime.now().plus({ minutes: 10 }),
    })

    const response = await client.post('/auth/verify-otp').json({ email, code: '000000' })

    response.assertStatus(401)
  })

  test('verify otp with expired code fails', async ({ client }) => {
    const email = 'expired@example.com'
    const user = await User.create({ email })
    await OtpToken.create({
      userId: user.id,
      code: '123456',
      expiresAt: DateTime.now().minus({ minutes: 1 }),
    })

    const response = await client.post('/auth/verify-otp').json({ email, code: '123456' })

    response.assertStatus(401)
  })
})

test.group('Auth | Protected', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('get me returns null when not authenticated', async ({ client }) => {
    const response = await client.get('/auth/me')
    response.assertStatus(200)
    response.assertBody({ status: 'success', data: null })
  })

  test('get me returns user', async ({ client }) => {
    const user = await User.create({ email: 'me@example.com' })
    const response = await client.get('/auth/me').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ status: 'success', data: { email: 'me@example.com' } })
  })

  test('get me returns isProfileComplete false when profile is incomplete', async ({ client }) => {
    const user = await User.create({ email: 'incomplete@example.com' })
    const response = await client.get('/auth/me').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ status: 'success', data: { isProfileComplete: false } })
  })

  test('get me returns isProfileComplete true when profile is complete', async ({ client }) => {
    const user = await User.create({
      email: 'complete@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678',
    })
    const response = await client.get('/auth/me').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ status: 'success', data: { isProfileComplete: true } })
  })

  test('logout', async ({ client }) => {
    const user = await User.create({ email: 'logout@example.com' })
    const response = await client.post('/auth/logout').loginAs(user)
    response.assertStatus(200)
  })
})

test.group('Auth | Profile Update', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('update profile successfully', async ({ client, assert }) => {
    const user = await User.create({ email: 'profile@example.com' })

    const response = await client
      .patch('/auth/user/profile')
      .json({
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0612345678',
      })
      .loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        email: 'profile@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0612345678',
      },
    })

    await user.refresh()
    assert.equal(user.firstName, 'Jean')
    assert.equal(user.lastName, 'Dupont')
    assert.equal(user.phone, '0612345678')
    assert.isTrue(user.isProfileComplete)
  })

  test('update profile requires authentication', async ({ client }) => {
    const response = await client.patch('/auth/user/profile').json({
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678',
    })

    response.assertStatus(401)
  })

  test('update profile validates firstName min length', async ({ client }) => {
    const user = await User.create({ email: 'validation@example.com' })

    const response = await client
      .patch('/auth/user/profile')
      .json({
        firstName: 'J',
        lastName: 'Dupont',
        phone: '0612345678',
      })
      .loginAs(user)

    response.assertStatus(422)
  })

  test('update profile validates lastName min length', async ({ client }) => {
    const user = await User.create({ email: 'validation@example.com' })

    const response = await client
      .patch('/auth/user/profile')
      .json({
        firstName: 'Jean',
        lastName: 'D',
        phone: '0612345678',
      })
      .loginAs(user)

    response.assertStatus(422)
  })

  test('update profile validates phone format', async ({ client }) => {
    const user = await User.create({ email: 'validation@example.com' })

    const response = await client
      .patch('/auth/user/profile')
      .json({
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '123456',
      })
      .loginAs(user)

    response.assertStatus(422)
  })

  test('update profile validates firstName characters', async ({ client }) => {
    const user = await User.create({ email: 'validation@example.com' })

    const response = await client
      .patch('/auth/user/profile')
      .json({
        firstName: 'Jean123',
        lastName: 'Dupont',
        phone: '0612345678',
      })
      .loginAs(user)

    response.assertStatus(422)
  })

  test('update profile accepts accented characters', async ({ client }) => {
    const user = await User.create({ email: 'accents@example.com' })

    const response = await client
      .patch('/auth/user/profile')
      .json({
        firstName: 'François',
        lastName: "O'Brien-Müller",
        phone: '0612345678',
      })
      .loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        firstName: 'François',
        lastName: "O'Brien-Müller",
      },
    })
  })

  test('user can only update their own profile', async ({ client, assert }) => {
    const user1 = await User.create({ email: 'user1@example.com' })
    const user2 = await User.create({ email: 'user2@example.com' })

    const response = await client
      .patch('/auth/user/profile')
      .json({
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0612345678',
      })
      .loginAs(user1)

    response.assertStatus(200)

    await user1.refresh()
    await user2.refresh()

    assert.equal(user1.firstName, 'Jean')
    assert.isNull(user2.firstName)
  })
})

test.group('Auth | My Players', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Player.query().delete()
    await Table.query().delete()
    await Tournament.query().delete()
    await User.query().delete()
  })

  test('returns empty array when user has no registrations', async ({ client }) => {
    const user = await User.create({ email: 'noplayers@example.com' })

    const response = await client.get('/auth/me/players').loginAs(user)

    response.assertStatus(200)
    response.assertBody([])
  })

  test('returns players from user registrations', async ({ client, assert }) => {
    const user = await User.create({ email: 'withplayers@example.com' })

    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 7 }),
      endDate: DateTime.now().plus({ days: 8 }),
      location: 'Test Location',
    })

    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Table A',
      date: DateTime.now().plus({ days: 7 }),
      startTime: '10:00',
      pointsMin: 0,
      pointsMax: 4000,
      quota: 10,
      price: 10,
      isSpecial: false,
    })

    const player1 = await Player.create({
      licence: '1234567',
      firstName: 'John',
      lastName: 'Doe',
      club: 'Test Club',
      points: 1000,
      needsVerification: false,
      userId: user.id,
    })

    const player2 = await Player.create({
      licence: '7654321',
      firstName: 'Jane',
      lastName: 'Doe',
      club: 'Test Club',
      points: 1200,
      needsVerification: false,
      userId: user.id,
    })

    await Registration.create({
      userId: user.id,
      playerId: player1.id,
      tableId: table.id,
      status: 'paid',
    })

    await Registration.create({
      userId: user.id,
      playerId: player2.id,
      tableId: table.id,
      status: 'pending_payment',
    })

    const response = await client.get('/auth/me/players').loginAs(user)

    response.assertStatus(200)
    const players = response.body()
    assert.lengthOf(players, 2)
    assert.includeDeepMembers(
      players.map((p: { licence: string }) => p.licence),
      ['1234567', '7654321']
    )
  })

  test('does not return players from cancelled registrations', async ({ client, assert }) => {
    const user = await User.create({ email: 'cancelled@example.com' })

    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 7 }),
      endDate: DateTime.now().plus({ days: 8 }),
      location: 'Test Location',
    })

    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Table A',
      date: DateTime.now().plus({ days: 7 }),
      startTime: '10:00',
      pointsMin: 0,
      pointsMax: 4000,
      quota: 10,
      price: 10,
      isSpecial: false,
    })

    const player = await Player.create({
      licence: '9999999',
      firstName: 'Cancelled',
      lastName: 'Player',
      club: 'Test Club',
      points: 500,
      needsVerification: false,
    })

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
    })

    const response = await client.get('/auth/me/players').loginAs(user)

    response.assertStatus(200)
    assert.lengthOf(response.body(), 0)
  })

  test('returns distinct players (no duplicates)', async ({ client, assert }) => {
    const user = await User.create({ email: 'distinct@example.com' })

    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 7 }),
      endDate: DateTime.now().plus({ days: 8 }),
      location: 'Test Location',
    })

    const table1 = await Table.create({
      tournamentId: tournament.id,
      name: 'Table A',
      date: DateTime.now().plus({ days: 7 }),
      startTime: '10:00',
      pointsMin: 0,
      pointsMax: 4000,
      quota: 10,
      price: 10,
      isSpecial: false,
    })

    const table2 = await Table.create({
      tournamentId: tournament.id,
      name: 'Table B',
      date: DateTime.now().plus({ days: 7 }),
      startTime: '12:00',
      pointsMin: 0,
      pointsMax: 4000,
      quota: 10,
      price: 15,
      isSpecial: false,
    })

    const player = await Player.create({
      licence: '1111111',
      firstName: 'Same',
      lastName: 'Player',
      club: 'Test Club',
      points: 800,
      needsVerification: false,
      userId: user.id,
    })

    // Same player registered to two tables
    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table1.id,
      status: 'paid',
    })

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table2.id,
      status: 'paid',
    })

    const response = await client.get('/auth/me/players').loginAs(user)

    response.assertStatus(200)
    assert.lengthOf(response.body(), 1)
    assert.equal(response.body()[0].licence, '1111111')
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/auth/me/players')
    response.assertStatus(401)
  })
})
