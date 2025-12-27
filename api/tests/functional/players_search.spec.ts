import { test } from '@japa/runner'
import User from '#models/user'
import Player from '#models/player'

test.group('Players Search', () => {

  test('search existing player by licence', async ({ client }) => {
    const response = await client.get('/api/players/search').qs({ licence: '1234567' })

    response.assertStatus(200)
    response.assertBodyContains({
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'DUPONT',
      club: 'PING PONG CLUB DE PARIS',
    })
  })

  test('search non-existent player', async ({ client }) => {
    const response = await client.get('/api/players/search').qs({ licence: '0000000' })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Player not found',
    })
  })

  test('search without licence param', async ({ client }) => {
    const response = await client.get('/api/players/search')

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Licence is required',
    })
  })

  test('search with invalid licence format (letters)', async ({ client }) => {
    const response = await client.get('/api/players/search').qs({ licence: 'ABC1234' })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Invalid licence format. Must be 6 to 8 digits.',
    })
  })

  test('search with invalid licence format (too short)', async ({ client }) => {
    const response = await client.get('/api/players/search').qs({ licence: '12345' })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Invalid licence format. Must be 6 to 8 digits.',
    })
  })

  test('search with invalid licence format (too long)', async ({ client }) => {
    const response = await client.get('/api/players/search').qs({ licence: '123456789' })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Invalid licence format. Must be 6 to 8 digits.',
    })
  })

  test('search returns all player fields', async ({ client, assert }) => {
    const response = await client.get('/api/players/search').qs({ licence: '9999999' })

    response.assertStatus(200)
    const body = response.body()

    // Verify all expected fields are present
    assert.equal(body.licence, '9999999')
    assert.equal(body.firstName, 'Camille')
    assert.equal(body.lastName, 'LEROY')
    assert.equal(body.club, 'REIMS EUROPE')
    assert.equal(body.points, 2800)
    assert.equal(body.sex, 'F')
    assert.equal(body.category, 'Senior')
    // needsVerification should not be present for verified players from API
    assert.notProperty(body, 'needsVerification')
  })

  test('search player with different category', async ({ client }) => {
    // Test a player from the expanded mock data with Veteran category
    const response = await client.get('/api/players/search').qs({ licence: '2121212' })

    response.assertStatus(200)
    response.assertBodyContains({
      licence: '2121212',
      firstName: 'Florian',
      lastName: 'FONTAINE',
      category: 'Veteran',
    })
  })
})

test.group('Players Link', (group) => {
  group.each.setup(async () => {
    await Player.query().delete()
    await User.query().delete()
  })

  test('link player to user creates new player', async ({ client, assert }) => {
    const user = await User.create({ email: 'user@example.com' })

    const response = await client.post('/api/players/link').json({
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'DUPONT',
      club: 'PING PONG CLUB DE PARIS',
      points: 1500,
      sex: 'M',
      category: 'Senior',
    }).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'DUPONT',
    })

    // Verify player is linked to user
    const player = await Player.findBy('licence', '1234567')
    assert.isNotNull(player)
    assert.equal(player?.userId, user.id)
  })

  test('link player updates existing player and links to user', async ({ client, assert }) => {
    const user = await User.create({ email: 'user@example.com' })

    // Create an existing player without user link
    const existingPlayer = await Player.create({
      licence: '7654321',
      firstName: 'Marie',
      lastName: 'MARTIN',
      club: 'OLD CLUB',
      points: 500,
    })

    const response = await client.post('/api/players/link').json({
      licence: '7654321',
      firstName: 'Marie',
      lastName: 'MARTIN',
      club: 'LYON TT',
      points: 950,
      sex: 'F',
      category: 'Junior',
    }).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      licence: '7654321',
      club: 'LYON TT',
      points: 950,
    })

    // Verify player is updated and linked
    await existingPlayer.refresh()
    assert.equal(existingPlayer.userId, user.id)
    assert.equal(existingPlayer.club, 'LYON TT')
    assert.equal(existingPlayer.points, 950)
  })

  test('link player with needsVerification flag', async ({ client, assert }) => {
    const user = await User.create({ email: 'user@example.com' })

    const response = await client.post('/api/players/link').json({
      licence: '9999999',
      firstName: 'Manuel',
      lastName: 'ENTRY',
      club: 'UNKNOWN CLUB',
      points: 500,
      needsVerification: true,
    }).loginAs(user)

    response.assertStatus(200)

    const player = await Player.findBy('licence', '9999999')
    assert.isNotNull(player)
    assert.isTrue(player?.needsVerification)
  })

  test('link player requires authentication', async ({ client }) => {
    const response = await client.post('/api/players/link').json({
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'DUPONT',
      club: 'PING PONG CLUB DE PARIS',
      points: 1500,
    })

    response.assertStatus(401)
  })
})
