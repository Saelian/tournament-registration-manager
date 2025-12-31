import helloAssoConfig from '#config/helloasso'
import logger from '@adonisjs/core/services/logger'

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

interface InitCheckoutParams {
  totalAmount: number
  itemName: string
  backUrl: string
  returnUrl: string
  errorUrl: string
  payer?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  metadata?: Record<string, string>
}

interface InitCheckoutResponse {
  id: number
  redirectUrl: string
}

interface CheckoutIntentResponse {
  id: number
  redirectUrl: string
  order?: {
    id: number
    formSlug: string
    formType: string
    organizationName: string
    organizationSlug: string
    meta: {
      createdAt: string
      updatedAt: string
    }
  }
  metadata?: Record<string, string>
}

export class HelloAssoRefundError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string
  ) {
    super(message)
    this.name = 'HelloAssoRefundError'
  }
}

class HelloAssoService {
  private accessToken: string | null = null
  private tokenExpiresAt: Date | null = null

  private get baseUrl(): string {
    return helloAssoConfig.baseUrl
  }

  private get authUrl(): string {
    return helloAssoConfig.sandbox
      ? 'https://api.helloasso-sandbox.com/oauth2/token'
      : 'https://api.helloasso.com/oauth2/token'
  }

  async authenticate(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken
    }

    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: helloAssoConfig.clientId,
        client_secret: helloAssoConfig.clientSecret,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HelloAsso authentication failed: ${response.status} - ${errorText}`)
    }

    const data = (await response.json()) as TokenResponse

    this.accessToken = data.access_token
    this.tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000 - 60000)

    return this.accessToken
  }

  async initCheckout(params: InitCheckoutParams): Promise<InitCheckoutResponse> {
    const token = await this.authenticate()
    const organizationSlug = helloAssoConfig.organizationSlug

    const response = await fetch(
      `${this.baseUrl}/v5/organizations/${organizationSlug}/checkout-intents`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount: params.totalAmount,
          initialAmount: params.totalAmount,
          itemName: params.itemName,
          backUrl: params.backUrl,
          returnUrl: params.returnUrl,
          errorUrl: params.errorUrl,
          containsDonation: false,
          payer: params.payer,
          metadata: params.metadata,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HelloAsso initCheckout failed: ${response.status} - ${errorText}`)
    }

    return (await response.json()) as InitCheckoutResponse
  }

  async getCheckoutIntent(checkoutIntentId: number): Promise<CheckoutIntentResponse> {
    const token = await this.authenticate()
    const organizationSlug = helloAssoConfig.organizationSlug

    const response = await fetch(
      `${this.baseUrl}/v5/organizations/${organizationSlug}/checkout-intents/${checkoutIntentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HelloAsso getCheckoutIntent failed: ${response.status} - ${errorText}`)
    }

    return (await response.json()) as CheckoutIntentResponse
  }

  /**
   * Refund a payment via HelloAsso API.
   * This will refund the entire payment amount - partial refunds are not supported.
   *
   * @param helloAssoPaymentId - The HelloAsso payment ID (from Order.payments[].id)
   * @throws HelloAssoRefundError if the refund fails
   */
  async refundPayment(helloAssoPaymentId: string): Promise<void> {
    const token = await this.authenticate()
    const url = `${this.baseUrl}/v5/payments/${helloAssoPaymentId}/refund`

    const requestHeaders = {
      Authorization: `Bearer ${token.slice(0, 20)}...`, // Tronqué pour les logs
      'Content-Type': 'application/json',
    }

    logger.info('=== HelloAsso Refund Request ===')
    logger.info(`URL: ${url}`)
    logger.info(`Method: POST`)
    logger.info(`Headers: ${JSON.stringify(requestHeaders)}`)
    logger.info(`HelloAsso Payment ID: ${helloAssoPaymentId}`)
    logger.info(`Organization Slug: ${helloAssoConfig.organizationSlug}`)
    logger.info(`Sandbox Mode: ${helloAssoConfig.sandbox}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const responseText = await response.text()

    logger.info('=== HelloAsso Refund Response ===')
    logger.info(`Status: ${response.status} ${response.statusText}`)
    logger.info(
      `Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`
    )
    logger.info(`Response Body: ${responseText}`)

    if (!response.ok) {
      let errorCode: string | undefined

      // Try to parse error response for specific error codes
      try {
        const errorJson = JSON.parse(responseText)
        errorCode = errorJson.code || errorJson.errorCode
      } catch {
        // Ignore parse errors
      }

      throw new HelloAssoRefundError(
        `HelloAsso refund failed: ${response.status} - ${responseText}`,
        response.status,
        errorCode
      )
    }

    logger.info('=== HelloAsso Refund Success ===')
  }
}

const helloAssoService = new HelloAssoService()
export default helloAssoService
