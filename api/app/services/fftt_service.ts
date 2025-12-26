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
      this.client = new FFTTClient({
        appId: env.get('FFTT_APP_ID') || '',
        serie: env.get('FFTT_SERIE') || '',
        password: env.get('FFTT_PASSWORD') || '',
      })
    }
  }

  async searchByLicence(licence: string): Promise<Player | null> {
    return this.client.searchByLicence(licence)
  }
}

const ffttService = new FfttService()
export default ffttService
