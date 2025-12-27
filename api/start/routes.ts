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
const AuthController = () => import('#controllers/auth_controller')
const TournamentController = () => import('#controllers/tournament_controller')
const TablesController = () => import('#controllers/tables_controller')
const PlayersController = () => import('#controllers/players_controller')

router.get('/', async () => 'It works!')

// Public routes
router.get('/tournaments', [TournamentController, 'index'])
router.get('/tournaments/:tournamentId/tables', [TablesController, 'byTournament'])
router.get('/players/search', [PlayersController, 'search'])

// Auth routes
router.group(() => {
  router.post('/request-otp', [AuthController, 'requestOtp'])
  router.post('/verify-otp', [AuthController, 'verifyOtp'])
}).prefix('/auth')

// User protected routes
router.group(() => {
  router.post('/auth/logout', [AuthController, 'logout'])
  router.get('/auth/me', [AuthController, 'me'])
}).use(middleware.auth({ guards: ['web'] }))

router
  .group(() => {
    router.post('/login', [AdminAuthController, 'login'])

    router
      .group(() => {
        router.post('/logout', [AdminAuthController, 'logout'])
        router.get('/me', [AdminAuthController, 'me'])

        router.get('/tournament', [TournamentController, 'show'])
        router.put('/tournament', [TournamentController, 'update'])

        router.resource('tables', TablesController).apiOnly()
      })
      .use(middleware.adminAuth())
  })
  .prefix('/admin')
