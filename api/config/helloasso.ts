import env from '#start/env'

const helloAssoConfig = {
    clientId: env.get('HELLOASSO_CLIENT_ID', ''),
    clientSecret: env.get('HELLOASSO_CLIENT_SECRET', ''),
    organizationSlug: env.get('HELLOASSO_ORGANIZATION_SLUG', ''),
    sandbox: env.get('HELLOASSO_SANDBOX', true),

    get baseUrl() {
        return this.sandbox ? 'https://api.helloasso-sandbox.com' : 'https://api.helloasso.com'
    },

    paymentExpirationMinutes: env.get('PAYMENT_EXPIRATION_MINUTES', 30),
    cleanupIntervalMinutes: env.get('PAYMENT_CLEANUP_INTERVAL_MINUTES', 5),
}

export default helloAssoConfig
