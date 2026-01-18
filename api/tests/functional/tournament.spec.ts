import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'

test.group('Tournament | Configuration', (group) => {
  group.each.setup(async () => {
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      {
        fullName: 'Administrator',
        password: 'password',
      }
    )
    await Tournament.query().delete()
  })

  test('get tournament returns 404 when not configured', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client.get('/admin/tournament').withGuard('admin').loginAs(admin)

    response.assertStatus(404)
    response.assertBodyContains({
      status: 'error',
      code: 'NOT_FOUND',
    })
  })

  test('create tournament configuration via PUT', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Test Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: { waitlistTimerHours: 6 },
      })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'Test Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: { waitlistTimerHours: 6 },
      },
    })

    const tournament = await Tournament.first()
    assert.isNotNull(tournament)
    assert.equal(tournament!.name, 'Test Tournament')
  })

  test('update existing tournament configuration', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    await Tournament.create({
      name: 'Initial Tournament',
      startDate: DateTime.fromISO('2025-06-15'),
      endDate: DateTime.fromISO('2025-06-16'),
      location: 'Lyon',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
      },
    })

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Updated Tournament',
        startDate: '2025-07-01',
        endDate: '2025-07-02',
        location: 'Marseille',
        options: {
          refundDeadline: '2025-06-25',
          waitlistTimerHours: 8,
        },
      })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'Updated Tournament',
        startDate: '2025-07-01',
        endDate: '2025-07-02',
        location: 'Marseille',
        options: {
          refundDeadline: '2025-06-25',
          waitlistTimerHours: 8,
        },
      },
    })
  })

  test('get tournament returns configuration when exists', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    await Tournament.create({
      name: 'My Tournament',
      startDate: DateTime.fromISO('2025-06-15'),
      endDate: DateTime.fromISO('2025-06-16'),
      location: 'Nice',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
      },
    })

    const response = await client.get('/admin/tournament').withGuard('admin').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'My Tournament',
        location: 'Nice',
      },
    })
  })

  test('fail with invalid dates (end before start)', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client.put('/admin/tournament').withGuard('admin').loginAs(admin).json({
      name: 'Test Tournament',
      startDate: '2025-06-20',
      endDate: '2025-06-15',
      location: 'Paris',
    })

    response.assertStatus(422)
  })

  test('default waitlist timer is 4 hours', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client.put('/admin/tournament').withGuard('admin').loginAs(admin).json({
      name: 'Test Tournament',
      startDate: '2025-06-15',
      endDate: '2025-06-16',
      location: 'Paris',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        options: {
          waitlistTimerHours: 4,
        },
      },
    })

    const tournament = await Tournament.first()
    assert.equal(tournament!.options.waitlistTimerHours, 4)
  })

  test('fail to access without authentication', async ({ client }) => {
    const response = await client.get('/admin/tournament')
    response.assertStatus(401)
  })
})

test.group('Tournament | FAQ Configuration', (group) => {
  group.each.setup(async () => {
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      {
        fullName: 'Administrator',
        password: 'password',
      }
    )
    await Tournament.query().delete()
  })

  test('create tournament with FAQ items', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const faqItems = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        question: "Comment puis-je m'inscrire ?",
        answer: "Rendez-vous sur la page d'inscription et suivez les étapes.",
        order: 0,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        question: 'Quelle est la politique de remboursement ?',
        answer: "Les remboursements sont possibles jusqu'à 7 jours avant le tournoi.",
        order: 1,
      },
    ]

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Tournament with FAQ',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: {
          waitlistTimerHours: 4,
          faqItems,
        },
      })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'Tournament with FAQ',
        options: {
          faqItems,
        },
      },
    })

    const tournament = await Tournament.first()
    assert.isNotNull(tournament)
    assert.lengthOf(tournament!.options.faqItems!, 2)
    assert.equal(tournament!.options.faqItems![0].question, "Comment puis-je m'inscrire ?")
  })

  test('update tournament FAQ items', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    await Tournament.create({
      name: 'Tournament',
      startDate: DateTime.fromISO('2025-06-15'),
      endDate: DateTime.fromISO('2025-06-16'),
      location: 'Paris',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
        faqItems: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            question: 'Question initiale',
            answer: 'Réponse initiale',
            order: 0,
          },
        ],
      },
    })

    const updatedFaqItems = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        question: 'Question modifiée',
        answer: 'Réponse modifiée',
        order: 0,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        question: 'Nouvelle question',
        answer: 'Nouvelle réponse',
        order: 1,
      },
    ]

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: {
          waitlistTimerHours: 4,
          faqItems: updatedFaqItems,
        },
      })

    response.assertStatus(200)

    const tournament = await Tournament.first()
    assert.lengthOf(tournament!.options.faqItems!, 2)
    assert.equal(tournament!.options.faqItems![0].question, 'Question modifiée')
    assert.equal(tournament!.options.faqItems![1].question, 'Nouvelle question')
  })

  test('tournament without FAQ items returns empty array', async ({ client, assert }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client.put('/admin/tournament').withGuard('admin').loginAs(admin).json({
      name: 'Tournament without FAQ',
      startDate: '2025-06-15',
      endDate: '2025-06-16',
      location: 'Paris',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        options: {
          faqItems: [],
        },
      },
    })

    const tournament = await Tournament.first()
    assert.deepEqual(tournament!.options.faqItems, [])
  })

  test('fail with invalid FAQ item - missing question', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: {
          faqItems: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              question: '',
              answer: 'Une réponse valide',
              order: 0,
            },
          ],
        },
      })

    response.assertStatus(422)
  })

  test('fail with invalid FAQ item - missing answer', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: {
          faqItems: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              question: 'Une question valide',
              answer: '',
              order: 0,
            },
          ],
        },
      })

    response.assertStatus(422)
  })

  test('fail with invalid FAQ item - invalid UUID', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: {
          faqItems: [
            {
              id: 'not-a-valid-uuid',
              question: 'Une question valide',
              answer: 'Une réponse valide',
              order: 0,
            },
          ],
        },
      })

    response.assertStatus(422)
  })

  test('fail with FAQ question exceeding max length', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: {
          faqItems: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              question: 'Q'.repeat(501),
              answer: 'Une réponse valide',
              order: 0,
            },
          ],
        },
      })

    response.assertStatus(422)
  })

  test('fail with FAQ answer exceeding max length', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .put('/admin/tournament')
      .withGuard('admin')
      .loginAs(admin)
      .json({
        name: 'Tournament',
        startDate: '2025-06-15',
        endDate: '2025-06-16',
        location: 'Paris',
        options: {
          faqItems: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              question: 'Une question valide',
              answer: 'R'.repeat(2001),
              order: 0,
            },
          ],
        },
      })

    response.assertStatus(422)
  })

  test('public API returns FAQ items', async ({ client }) => {
    await Tournament.create({
      name: 'Public Tournament',
      startDate: DateTime.fromISO('2025-06-15'),
      endDate: DateTime.fromISO('2025-06-16'),
      location: 'Paris',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
        faqItems: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            question: 'Question publique',
            answer: 'Réponse publique',
            order: 0,
          },
        ],
      },
    })

    const response = await client.get('/tournaments')

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: [
        {
          name: 'Public Tournament',
          options: {
            faqItems: [
              {
                question: 'Question publique',
                answer: 'Réponse publique',
              },
            ],
          },
        },
      ],
    })
  })
})
