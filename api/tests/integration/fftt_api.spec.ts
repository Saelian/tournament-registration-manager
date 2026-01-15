import { test } from '@japa/runner'
import env from '#start/env'
import { FFTTClient } from '@tournament-app/fftt-client'

test.group('FFTT API Integration (Real)', () => {
    const appId = env.get('FFTT_APP_ID')
    const password = env.get('FFTT_PASSWORD')
    // In integration tests, we want to allow generating a serial if needed
    // But usually for CI/CD we might want a fixed one.
    // For this test, we'll let the client logic or our manual logic handle it.

    // We only run this if we have credentials
    const hasCredentials = appId && password

    test('search player MARIE Jérémy (2816354)', async ({ assert }) => {
        if (!hasCredentials) {
            console.warn('Skipping FFTT Real API test: No credentials found in .env')
            return
        }

        // Generate a serial for testing purposes
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let serie = ''
        for (let i = 0; i < 15; i++) {
            serie += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        console.log('Testing with generated serial:', serie)

        const client = new FFTTClient({
            appId: appId!,
            password: password!,
            serie: serie,
        })

        // 1. Initialize
        const initResult = await client.initialize()
        assert.isTrue(initResult, 'FFTT Initialization failed')

        // 2. Search
        const player = await client.searchByLicence('2816354')

        assert.exists(player, 'Player should be found')
        assert.equal(player?.lastName, 'MARIE')
        assert.equal(player?.firstName, 'Jeremy')
        assert.equal(player?.licence, '2816354')

        console.log('Found player:', player)
    }).timeout(10000) // Increase timeout for real network call
})
