import { test } from '@japa/runner'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'

test.group('Tournament phase | Public API', (group) => {
  group.each.setup(async () => {
    await Tournament.query().delete()
  })

  test('retourne phase=before par défaut', async ({ client }) => {
    await Tournament.create({
      name: 'Test',
      startDate: DateTime.fromISO('2026-05-16'),
      endDate: DateTime.fromISO('2026-05-17'),
      location: 'Champhol',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
        faqItems: [],
      },
    })

    const response = await client.get('/tournaments')
    response.assertStatus(200)
    response.assertBodyContains({
      data: [{ phase: 'before', eventResultUrl: null, eventContent: null }],
    })
  })

  test('retourne les champs événement quand phase=event', async ({ client }) => {
    await Tournament.create({
      name: 'Test',
      startDate: DateTime.fromISO('2026-05-16'),
      endDate: DateTime.fromISO('2026-05-17'),
      location: 'Champhol',
      phase: 'event',
      eventResultUrl: 'https://docs.google.com/spreadsheets/d/123',
      eventContent: '**Buvette** : sandwich 3€',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
        faqItems: [],
      },
    })

    const response = await client.get('/tournaments')
    response.assertStatus(200)
    response.assertBodyContains({
      data: [
        {
          phase: 'event',
          eventResultUrl: 'https://docs.google.com/spreadsheets/d/123',
          eventContent: '**Buvette** : sandwich 3€',
        },
      ],
    })
  })
})
