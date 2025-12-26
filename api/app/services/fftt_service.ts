import env from '#start/env'
import { FFTTClient, MockFFTTClient, FFTTClientInterface, Player } from '@tournament-app/fftt-client'

class FfttService {
  private client: FFTTClientInterface

  constructor() {
    // Force mock if FFTT_MOCK is true, otherwise use mock in development unless configured otherwise
    // Actually simpler: Use real client only if configured AND not forced to mock.
    // Or: Use Mock if FFTT_MOCK is true OR (NODE_ENV is not production AND credentials are missing)
    
    const forceMock = env.get('FFTT_MOCK')
    const hasCredentials = env.get('FFTT_APP_ID') && env.get('FFTT_SERIE')

    if (forceMock || (!hasCredentials && env.get('NODE_ENV') !== 'production')) {
      this.client = new MockFFTTClient()
    } else {
      let serie = env.get('FFTT_SERIE')
      let shouldInitialize = false

      if (!serie) {
        // Auto-generate a random 15-character alphanumeric serial
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 15; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        serie = result
        shouldInitialize = true
      }

      this.client = new FFTTClient({
        appId: env.get('FFTT_APP_ID') || '',
        serie: serie,
        password: env.get('FFTT_PASSWORD') || '',
      })

      if (shouldInitialize) {
        // Attempt to initialize the generated serial
        // We do this without awaiting to not block constructor, handling error silently/logging
        this.client.initialize().catch((error) => {
          console.warn('Failed to auto-initialize FFTT serial:', error)
        })
      }
    }
  }

  async searchByLicence(licence: string): Promise<Player | null> {
    return this.client.searchByLicence(licence)
  }
}

const ffttService = new FfttService()
export default ffttService
