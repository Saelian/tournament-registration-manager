import { test } from '@japa/runner'
import User from '#models/user'
import OtpToken from '#models/otp_token'
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
        expiresAt: DateTime.now().plus({ minutes: 10 })
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
        expiresAt: DateTime.now().plus({ minutes: 10 })
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
         expiresAt: DateTime.now().minus({ minutes: 1 })
     })
 
     const response = await client.post('/auth/verify-otp').json({ email, code: '123456' })
     
     response.assertStatus(401)
  })
})

test.group('Auth | Protected', (group) => {
    group.each.setup(async () => {
        await User.query().delete()
    })

    test('get me returns user', async ({ client }) => {
        const user = await User.create({ email: 'me@example.com' })
        const response = await client.get('/auth/me').loginAs(user)
        response.assertStatus(200)
        response.assertBodyContains({ email: 'me@example.com' })
    })

    test('logout', async ({ client }) => {
        const user = await User.create({ email: 'logout@example.com' })
        const response = await client.post('/auth/logout').loginAs(user)
        response.assertStatus(200)
    })
})
