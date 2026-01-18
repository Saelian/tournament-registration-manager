import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Admin from '#models/admin'
import env from '#start/env'

export default class extends BaseSeeder {
  async run() {
    await Admin.updateOrCreate(
      { email: env.get('ADMIN_EMAIL') },
      {
        fullName: env.get('ADMIN_NAME'),
        password: env.get('ADMIN_PASSWORD'),
      }
    )
  }
}
