import env from '#start/env'
import { FFTTClient, MockFFTTClient, FFTTClientInterface, Player, FFTTApiError } from '@tournament-app/fftt-client'

export { FFTTApiError }

class FfttService {
  private client: FFTTClientInterface
  private initPromise: Promise<boolean> | null = null
  private initialized = false

  constructor() {
    // Force mock if FFTT_MOCK is true, otherwise use mock in development unless configured otherwise
    const forceMock = env.get('FFTT_MOCK')
    const hasCredentials = env.get('FFTT_APP_ID') && env.get('FFTT_SERIE')

    if (forceMock || (!hasCredentials && env.get('NODE_ENV') !== 'production')) {
      this.client = new MockFFTTClient()
      this.initialized = true // Mock client doesn't need initialization
    } else {
      let serie = env.get('FFTT_SERIE')

      if (!serie) {
        // Auto-generate a random 15-character alphanumeric serial
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 15; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        serie = result
      }

      this.client = new FFTTClient({
        appId: env.get('FFTT_APP_ID') || '',
        serie: serie,
        password: env.get('FFTT_PASSWORD') || '',
      })

      // Mark as needing initialization if serie was auto-generated
      this.initialized = !!env.get('FFTT_SERIE')
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return

    // Use existing promise if initialization is in progress
    if (!this.initPromise) {
      this.initPromise = this.client.initialize()
    }

    const success = await this.initPromise
    if (!success) {
      throw new FFTTApiError('Failed to initialize FFTT client')
    }
    this.initialized = true
  }

  async searchByLicence(licence: string): Promise<Player | null> {
    await this.ensureInitialized()
    return this.client.searchByLicence(licence)
  }
}

const ffttService = new FfttService()
export default ffttService
