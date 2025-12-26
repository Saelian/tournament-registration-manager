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
})
