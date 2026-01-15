import { test } from '@japa/runner'
import helloAssoService, { HelloAssoRefundError } from '#services/hello_asso_service'

test.group('HelloAssoService - refundPayment', (group) => {
    let originalFetch: typeof global.fetch

    group.each.setup(() => {
        originalFetch = global.fetch
    })

    group.each.teardown(() => {
        global.fetch = originalFetch
    })

    test('refundPayment calls the correct endpoint with payment ID', async ({ assert }) => {
        let calledUrl = ''
        let calledOptions: RequestInit | undefined

        global.fetch = async (url, options) => {
            // Auth call (may or may not happen depending on token cache)
            if (url.toString().includes('oauth2/token')) {
                return new Response(
                    JSON.stringify({
                        access_token: 'test-token',
                        refresh_token: 'test-refresh',
                        token_type: 'Bearer',
                        expires_in: 3600,
                    }),
                    { status: 200 }
                )
            }

            // Refund call
            calledUrl = url.toString()
            calledOptions = options as RequestInit
            return new Response(null, { status: 200 })
        }

        await helloAssoService.refundPayment('12345')

        assert.include(calledUrl, '/v5/payments/12345/refund')
        assert.equal(calledOptions?.method, 'POST')
    })

    test('refundPayment throws HelloAssoRefundError on API error', async ({ assert }) => {
        global.fetch = async (url) => {
            // Auth call
            if (url.toString().includes('oauth2/token')) {
                return new Response(
                    JSON.stringify({
                        access_token: 'test-token-2',
                        refresh_token: 'test-refresh',
                        token_type: 'Bearer',
                        expires_in: 3600,
                    }),
                    { status: 200 }
                )
            }

            // Refund call returns error
            return new Response(
                JSON.stringify({
                    code: 'ALREADY_REFUNDED',
                    message: 'This payment has already been refunded',
                }),
                { status: 400 }
            )
        }

        let caughtError: HelloAssoRefundError | null = null
        try {
            await helloAssoService.refundPayment('12345')
        } catch (error) {
            caughtError = error as HelloAssoRefundError
        }

        assert.isNotNull(caughtError)
        assert.equal(caughtError!.name, 'HelloAssoRefundError')
        assert.equal(caughtError!.statusCode, 400)
        assert.equal(caughtError!.errorCode, 'ALREADY_REFUNDED')
    })

    test('refundPayment throws HelloAssoRefundError on 403 forbidden', async ({ assert }) => {
        global.fetch = async (url) => {
            if (url.toString().includes('oauth2/token')) {
                return new Response(
                    JSON.stringify({
                        access_token: 'test-token-3',
                        refresh_token: 'test-refresh',
                        token_type: 'Bearer',
                        expires_in: 3600,
                    }),
                    { status: 200 }
                )
            }

            return new Response('Forbidden - Missing RefundManagement privilege', { status: 403 })
        }

        let caughtError: HelloAssoRefundError | null = null
        try {
            await helloAssoService.refundPayment('12345')
        } catch (error) {
            caughtError = error as HelloAssoRefundError
        }

        assert.isNotNull(caughtError)
        assert.equal(caughtError!.name, 'HelloAssoRefundError')
        assert.equal(caughtError!.statusCode, 403)
    })

    test('refundPayment throws HelloAssoRefundError on 404 not found', async ({ assert }) => {
        global.fetch = async (url) => {
            if (url.toString().includes('oauth2/token')) {
                return new Response(
                    JSON.stringify({
                        access_token: 'test-token-4',
                        refresh_token: 'test-refresh',
                        token_type: 'Bearer',
                        expires_in: 3600,
                    }),
                    { status: 200 }
                )
            }

            return new Response('Payment not found', { status: 404 })
        }

        let caughtError: HelloAssoRefundError | null = null
        try {
            await helloAssoService.refundPayment('99999')
        } catch (error) {
            caughtError = error as HelloAssoRefundError
        }

        assert.isNotNull(caughtError)
        assert.equal(caughtError!.name, 'HelloAssoRefundError')
        assert.equal(caughtError!.statusCode, 404)
    })
})
