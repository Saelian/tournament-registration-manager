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
const TournamentController = () => import('#controllers/tournament_controller')

router.get('/', async () => 'It works!')

router
  .group(() => {
    router.post('/login', [AdminAuthController, 'login'])

    router
      .group(() => {
        router.post('/logout', [AdminAuthController, 'logout'])
        router.get('/me', [AdminAuthController, 'me'])

        router.get('/tournament', [TournamentController, 'show'])
        router.put('/tournament', [TournamentController, 'update'])
      })
      .use(middleware.adminAuth())
  })
  .prefix('/admin')
