import { test } from '@japa/runner'
import Admin from '#models/admin'

test.group('Admin Auth | Login', (group) => {
  group.each.setup(async () => {
    // Ensure we have an admin
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      {
        fullName: 'Administrator',
        password: 'password',
      }
    )
  })

  test('login with valid credentials', async ({ client }) => {
    const response = await client.post('/admin/login').json({
      email: 'admin@example.com',
      password: 'password',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        email: 'admin@example.com',
      },
    })
  })

  test('fail login with invalid password', async ({ client }) => {
    const response = await client.post('/admin/login').json({
      email: 'admin@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      status: 'error',
      code: 'INVALID_CREDENTIALS',
    })
  })

  test('fail login with non-existent email', async ({ client }) => {
    const response = await client.post('/admin/login').json({
      email: 'none@example.com',
      password: 'password',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      status: 'error',
      code: 'INVALID_CREDENTIALS',
    })
  })
})

test.group('Admin Auth | Protected routes', (group) => {
  group.each.setup(async () => {
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      {
        fullName: 'Administrator',
        password: 'password',
      }
    )
  })

  test('access /admin/me with session', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client.get('/admin/me').withGuard('admin').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        id: admin.id,
        email: 'admin@example.com',
      },
    })
  })

  test('fail to access /admin/me without session', async ({ client }) => {
    const response = await client.get('/admin/me')

    response.assertStatus(401)
  })

  test('logout successfully', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client.post('/admin/logout').withGuard('admin').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
    })
  })
})