import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

/**
 * Crée le user système utilisé pour les inscriptions admin.
 * Ce user n'a pas de mot de passe et ne peut pas se connecter.
 */
export default class extends BaseSeeder {
  async run() {
    await User.firstOrCreate(
      { email: 'system@tournament.local' },
      {
        fullName: 'Système',
        firstName: 'Système',
        lastName: 'Tournament',
        phone: null,
        password: null,
      }
    )
  }
}
