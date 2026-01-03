/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AdminAuthController = () => import('#controllers/admin_auth_controller')
const AdminPaymentsController = () => import('#controllers/admin_payments_controller')
const AdminRegistrationsController = () => import('#controllers/admin_registrations_controller')
const AuthController = () => import('#controllers/auth_controller')
const RegistrationsController = () => import('#controllers/registrations_controller')
const TournamentController = () => import('#controllers/tournament_controller')
const TablesController = () => import('#controllers/tables_controller')
const SponsorsController = () => import('#controllers/sponsors_controller')
const TablePrizesController = () => import('#controllers/table_prizes_controller')
const TableSponsorsController = () => import('#controllers/table_sponsors_controller')
const PlayersController = () => import('#controllers/players_controller')
const PaymentsController = () => import('#controllers/payments_controller')
const WebhooksController = () => import('#controllers/webhooks_controller')

router.get('/', async () => 'Working...')

// Webhook routes (no auth, called by external services)
router.post('/webhooks/helloasso', [WebhooksController, 'helloasso'])

// Public routes
router.get('/tournaments', [TournamentController, 'index'])
router.get('/tournaments/:tournamentId/tables', [TablesController, 'byTournament'])
router.get('/tournaments/:tournamentId/sponsors', [SponsorsController, 'byTournament'])
router.get('/api/players/search', [PlayersController, 'search'])
router.post('/api/players/find-or-create', [PlayersController, 'findOrCreate'])
router.get('/api/tables/eligible', [TablesController, 'eligible'])
router.get('/api/registrations/public', [RegistrationsController, 'publicList'])

// Auth routes
router
  .group(() => {
    router.post('/request-otp', [AuthController, 'requestOtp'])
    router.post('/verify-otp', [AuthController, 'verifyOtp'])
    router.get('/me', [AuthController, 'me']) // Public: returns null if not authenticated
  })
  .prefix('/auth')

// User protected routes
router
  .group(() => {
    router.post('/auth/logout', [AuthController, 'logout'])
    router.patch('/auth/user/profile', [AuthController, 'updateProfile'])
    router.get('/auth/me/players', [AuthController, 'myPlayers'])
    router.get('/api/me/registrations', [RegistrationsController, 'myRegistrations'])
    router.post('/api/registrations/validate', [RegistrationsController, 'validate'])
    router.post('/api/registrations', [RegistrationsController, 'store'])
    router.get('/api/registrations/:id', [RegistrationsController, 'show'])
    router.delete('/api/registrations/:id', [RegistrationsController, 'destroy'])
    router.post('/api/players/link', [PlayersController, 'linkToUser'])
    router.post('/api/payments/create-intent', [PaymentsController, 'createIntent'])
    router.get('/api/payments/:id', [PaymentsController, 'show'])
    router.get('/api/payments/:id/refund-eligibility', [PaymentsController, 'refundEligibility'])
    router.post('/api/payments/:id/refund', [PaymentsController, 'refund'])
    router.get('/api/me/payments', [PaymentsController, 'myPayments'])
  })
  .use(middleware.auth({ guards: ['web'] }))

router
  .group(() => {
    router.post('/login', [AdminAuthController, 'login'])
    router.get('/me', [AdminAuthController, 'me']) // Public: returns null if not authenticated

    router
      .group(() => {
        router.post('/logout', [AdminAuthController, 'logout'])

        router.get('/tournament', [TournamentController, 'show'])
        router.put('/tournament', [TournamentController, 'update'])

        // Tables CSV import (before resource to avoid route conflicts)
        router.post('/tables/import/preview', [TablesController, 'previewImport'])
        router.post('/tables/import/confirm', [TablesController, 'confirmImport'])
        router.get('/tables/import/template', [TablesController, 'downloadTemplate'])

        router.resource('tables', TablesController).apiOnly()
        router.resource('tables.prizes', TablePrizesController).apiOnly()

        // Table-Sponsor associations
        router.get('/tables/:tableId/sponsors', [TableSponsorsController, 'index'])
        router.put('/tables/:tableId/sponsors', [TableSponsorsController, 'sync'])
        router.post('/tables/:tableId/sponsors/:sponsorId', [TableSponsorsController, 'attach'])
        router.delete('/tables/:tableId/sponsors/:sponsorId', [TableSponsorsController, 'detach'])

        router.resource('sponsors', SponsorsController).apiOnly()

        // Registrations management
        router.get('/registrations', [AdminRegistrationsController, 'index'])
        router.get('/tables/:id/registrations', [AdminRegistrationsController, 'byTable'])

        // Payments management
        router.get('/payments', [AdminPaymentsController, 'index'])
        router.post('/payments/:id/process-refund', [AdminPaymentsController, 'processRefund'])
      })
      .use(middleware.adminAuth())
  })
  .prefix('/admin')
