import mail from '@adonisjs/mail/services/main'
import edge from 'edge.js'
import app from '@adonisjs/core/services/app'

interface OtpLoginParams {
  email: string
  code: string
}

interface RefundRequestParams {
  adminEmail: string
  displayName: string
  userEmail: string
  amountFormatted: string
  paymentId: number
  paymentDate: string
}

interface WaitlistPromotedParams {
  email: string
  tableName: string
  playerFirstName: string
  playerLastName: string
  timerHours: number
  dashboardUrl: string
}

interface RegistrationExpiredParams {
  email: string
  cancelledEntries: Array<{ playerFirstName: string; playerLastName: string; tableName: string }>
  registrationUrl: string
}

class MailService {
  private templatesPath: string

  constructor() {
    this.templatesPath = app.makePath('resources/views/emails')
    edge.mount(this.templatesPath)
  }

  private async renderTemplate(templateName: string, data: Record<string, unknown>): Promise<string> {
    return edge.render(templateName, data)
  }

  async sendOtpLogin(params: OtpLoginParams): Promise<void> {
    const html = await this.renderTemplate('otp_login', { code: params.code })

    await mail.send((message) => {
      message.to(params.email).subject('Votre code de connexion').html(html)
    })
  }

  async sendRefundRequest(params: RefundRequestParams): Promise<void> {
    const html = await this.renderTemplate('admin_refund_request', {
      displayName: params.displayName,
      userEmail: params.userEmail,
      amountFormatted: params.amountFormatted,
      paymentId: params.paymentId,
      paymentDate: params.paymentDate,
    })

    await mail.send((message) => {
      message.to(params.adminEmail).subject(`Demande de remboursement - ${params.displayName}`).html(html)
    })
  }

  async sendWaitlistPromoted(params: WaitlistPromotedParams): Promise<void> {
    const html = await this.renderTemplate('waitlist_promoted', {
      tableName: params.tableName,
      playerFirstName: params.playerFirstName,
      playerLastName: params.playerLastName,
      timerHours: params.timerHours,
      dashboardUrl: params.dashboardUrl,
    })

    await mail.send((message) => {
      message.to(params.email).subject(`Une place s'est libérée - ${params.tableName}`).html(html)
    })
  }

  async sendRegistrationExpired(params: RegistrationExpiredParams): Promise<void> {
    const html = await this.renderTemplate('registration_expired', {
      cancelledEntries: params.cancelledEntries,
      registrationUrl: params.registrationUrl,
    })

    await mail.send((message) => {
      message.to(params.email).subject('Inscription annulée - Paiement non reçu').html(html)
    })
  }
}

const mailService = new MailService()
export default mailService
