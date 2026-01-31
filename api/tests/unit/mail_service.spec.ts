import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import mailService from '#services/mail_service'

test.group('MailService - sendOtpLogin', (group) => {
  group.each.teardown(() => {
    mail.restore()
  })

  test('sends email with correct recipient and subject', async ({ assert }) => {
    const fakeMailer = mail.fake()

    await mailService.sendOtpLogin({
      email: 'user@example.com',
      code: '123456',
    })

    const sentMessages = fakeMailer.messages.sent()
    assert.equal(sentMessages.length, 1)

    const sentMessage = sentMessages[0]
    sentMessage.assertTo('user@example.com')
    assert.equal(sentMessage.nodeMailerMessage.subject, 'Votre code de connexion')
  })

  test('includes OTP code in HTML content', async ({}) => {
    const fakeMailer = mail.fake()

    await mailService.sendOtpLogin({
      email: 'test@example.com',
      code: '987654',
    })

    const sentMessages = fakeMailer.messages.sent()
    const sentMessage = sentMessages[0]

    sentMessage.assertHtmlIncludes('987654')
    sentMessage.assertHtmlIncludes('Code de connexion')
    sentMessage.assertHtmlIncludes('10 minutes')
  })
})

test.group('MailService - sendRefundRequest', (group) => {
  group.each.teardown(() => {
    mail.restore()
  })

  test('sends email with correct recipient and subject', async ({ assert }) => {
    const fakeMailer = mail.fake()

    await mailService.sendRefundRequest({
      adminEmail: 'admin@example.com',
      displayName: 'Jean Dupont',
      userEmail: 'user@example.com',
      amountFormatted: '25.00',
      paymentId: 123,
      paymentDate: '15/01/2026 14:30',
    })

    const sentMessages = fakeMailer.messages.sent()
    assert.equal(sentMessages.length, 1)

    const sentMessage = sentMessages[0]
    sentMessage.assertTo('admin@example.com')
    assert.equal(sentMessage.nodeMailerMessage.subject, 'Demande de remboursement - Jean Dupont')
  })

  test('includes all refund details in HTML content', async () => {
    const fakeMailer = mail.fake()

    await mailService.sendRefundRequest({
      adminEmail: 'admin@example.com',
      displayName: 'Marie Martin',
      userEmail: 'marie@example.com',
      amountFormatted: '35.50',
      paymentId: 456,
      paymentDate: '20/01/2026 10:15',
    })

    const sentMessages = fakeMailer.messages.sent()
    const sentMessage = sentMessages[0]

    sentMessage.assertHtmlIncludes('Marie Martin')
    sentMessage.assertHtmlIncludes('marie@example.com')
    sentMessage.assertHtmlIncludes('35.50')
    sentMessage.assertHtmlIncludes('456')
    sentMessage.assertHtmlIncludes('20/01/2026 10:15')
    sentMessage.assertHtmlIncludes('Nouvelle demande de remboursement')
  })
})

test.group('MailService - sendWaitlistPromoted', (group) => {
  group.each.teardown(() => {
    mail.restore()
  })

  test('sends email with correct recipient and subject', async ({ assert }) => {
    const fakeMailer = mail.fake()

    await mailService.sendWaitlistPromoted({
      email: 'player@example.com',
      tableName: 'Tableau A - 1000pts',
      playerFirstName: 'Pierre',
      playerLastName: 'Durand',
      timerHours: 4,
      dashboardUrl: 'http://localhost:5173/dashboard',
    })

    const sentMessages = fakeMailer.messages.sent()
    assert.equal(sentMessages.length, 1)

    const sentMessage = sentMessages[0]
    sentMessage.assertTo('player@example.com')
    assert.equal(sentMessage.nodeMailerMessage.subject, "Une place s'est libérée - Tableau A - 1000pts")
  })

  test('includes all promotion details in HTML content', async () => {
    const fakeMailer = mail.fake()

    await mailService.sendWaitlistPromoted({
      email: 'subscriber@example.com',
      tableName: 'Tableau B - 1500pts',
      playerFirstName: 'Sophie',
      playerLastName: 'Bernard',
      timerHours: 6,
      dashboardUrl: 'https://tournament.example.com/dashboard',
    })

    const sentMessages = fakeMailer.messages.sent()
    const sentMessage = sentMessages[0]

    sentMessage.assertHtmlIncludes('Tableau B - 1500pts')
    sentMessage.assertHtmlIncludes('Sophie')
    sentMessage.assertHtmlIncludes('Bernard')
    sentMessage.assertHtmlIncludes('6 heures')
    sentMessage.assertHtmlIncludes('https://tournament.example.com/dashboard')
    sentMessage.assertHtmlIncludes('Bonne nouvelle')
    sentMessage.assertHtmlIncludes('Accéder à mon tableau de bord')
  })

  test('includes warning about payment deadline', async () => {
    const fakeMailer = mail.fake()

    await mailService.sendWaitlistPromoted({
      email: 'test@example.com',
      tableName: 'Tableau C',
      playerFirstName: 'Test',
      playerLastName: 'User',
      timerHours: 12,
      dashboardUrl: 'http://localhost/dashboard',
    })

    const sentMessages = fakeMailer.messages.sent()
    const sentMessage = sentMessages[0]

    sentMessage.assertHtmlIncludes('Attention')
    sentMessage.assertHtmlIncludes('automatiquement annulée')
  })
})

test.group('MailService - sendRegistrationExpired', (group) => {
  group.each.teardown(() => {
    mail.restore()
  })

  test('sends email with correct recipient and subject', async ({ assert }) => {
    const fakeMailer = mail.fake()

    await mailService.sendRegistrationExpired({
      email: 'player@example.com',
      cancelledEntries: [
        { playerFirstName: 'Jean', playerLastName: 'Dupont', tableName: 'Tableau A - 1000pts' },
      ],
      registrationUrl: 'http://localhost:5173',
    })

    const sentMessages = fakeMailer.messages.sent()
    assert.equal(sentMessages.length, 1)

    const sentMessage = sentMessages[0]
    sentMessage.assertTo('player@example.com')
    assert.equal(sentMessage.nodeMailerMessage.subject, 'Inscription annulée - Paiement non reçu')
  })

  test('includes all cancelled entries in HTML content', async () => {
    const fakeMailer = mail.fake()

    await mailService.sendRegistrationExpired({
      email: 'user@example.com',
      cancelledEntries: [
        { playerFirstName: 'Jean', playerLastName: 'Dupont', tableName: 'Tableau A - 1000pts' },
        { playerFirstName: 'Marie', playerLastName: 'Martin', tableName: 'Tableau B - 1500pts' },
      ],
      registrationUrl: 'https://tournament.example.com',
    })

    const sentMessages = fakeMailer.messages.sent()
    const sentMessage = sentMessages[0]

    sentMessage.assertHtmlIncludes('Jean')
    sentMessage.assertHtmlIncludes('Dupont')
    sentMessage.assertHtmlIncludes('Tableau A - 1000pts')
    sentMessage.assertHtmlIncludes('Marie')
    sentMessage.assertHtmlIncludes('Martin')
    sentMessage.assertHtmlIncludes('Tableau B - 1500pts')
    sentMessage.assertHtmlIncludes('https://tournament.example.com')
    sentMessage.assertHtmlIncludes('Inscription annulée')
    sentMessage.assertHtmlIncludes('Se réinscrire')
  })
})
