import { test } from '@japa/runner'
import Admin from '#models/admin'
import ace from '@adonisjs/core/services/ace'
import AdminCreate from '../../commands/admin_create.js'

test.group('Admin Create Command', (group) => {
  group.each.setup(async () => {
    // Nettoyer les admins de test avant chaque test
    await Admin.query().where('email', 'like', '%@test.com').delete()
  })

  group.each.teardown(async () => {
    // Nettoyer après chaque test
    await Admin.query().where('email', 'like', '%@test.com').delete()
  })

  test('crée un administrateur avec des données valides', async ({ assert }) => {
    const command = await ace.create(AdminCreate, ['test@test.com', 'Test Admin', '--password=Password123'])

    await command.exec()

    assert.equal(command.exitCode, 0)

    const admin = await Admin.findBy('email', 'test@test.com')
    assert.isNotNull(admin)
    assert.equal(admin!.fullName, 'Test Admin')
    assert.equal(admin!.email, 'test@test.com')
  })

  test('refuse de créer un admin avec un email déjà existant', async ({ assert }) => {
    // Créer d'abord un admin
    await Admin.create({
      email: 'duplicate@test.com',
      fullName: 'Existing Admin',
      password: 'Password123',
    })

    const command = await ace.create(AdminCreate, ['duplicate@test.com', 'New Admin', '--password=Password123'])

    await command.exec()

    assert.equal(command.exitCode, 1)

    // Vérifier qu'il n'y a qu'un seul admin avec cet email
    const admins = await Admin.query().where('email', 'duplicate@test.com')
    assert.equal(admins.length, 1)
    assert.equal(admins[0].fullName, 'Existing Admin')
  })

  test('refuse de créer un admin avec un mot de passe trop court', async ({ assert }) => {
    const command = await ace.create(AdminCreate, ['short@test.com', 'Test Admin', '--password=short'])

    await command.exec()

    assert.equal(command.exitCode, 1)

    const admin = await Admin.findBy('email', 'short@test.com')
    assert.isNull(admin)
  })

  test('refuse de créer un admin avec un email invalide', async ({ assert }) => {
    const command = await ace.create(AdminCreate, ['invalid-email', 'Test Admin', '--password=Password123'])

    await command.exec()

    assert.equal(command.exitCode, 1)

    const admin = await Admin.findBy('email', 'invalid-email')
    assert.isNull(admin)
  })
})
