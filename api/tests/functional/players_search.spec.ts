import { test } from '@japa/runner'

test.group('Players Search', () => {

  test('search existing player by licence', async ({ client }) => {
    const response = await client.get('/players/search').qs({ licence: '1234567' })

    response.assertStatus(200)
    response.assertBodyContains({
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'DUPONT',
      club: 'PING PONG CLUB DE PARIS',
    })
  })

  test('search non-existent player', async ({ client }) => {
    const response = await client.get('/players/search').qs({ licence: '0000000' })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Player not found',
    })
  })

  test('search without licence param', async ({ client }) => {
    const response = await client.get('/players/search')

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Licence is required',
    })
  })

  test('search returns all player fields', async ({ client, assert }) => {
    const response = await client.get('/players/search').qs({ licence: '9999999' })

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
    // toVerify should not be present for verified players from API
    assert.notProperty(body, 'toVerify')
  })

  test('search player with different category', async ({ client }) => {
    // Test a player from the expanded mock data with Veteran category
    const response = await client.get('/players/search').qs({ licence: '2121212' })

    response.assertStatus(200)
    response.assertBodyContains({
      licence: '2121212',
      firstName: 'Florian',
      lastName: 'FONTAINE',
      category: 'Veteran',
    })
  })
})
