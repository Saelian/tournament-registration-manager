import helloAssoConfig from '#config/helloasso'

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
}

const helloAssoService = new HelloAssoService()
export default helloAssoService
