import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payment_registrations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('payment_id').unsigned().references('id').inTable('payments').onDelete('CASCADE').notNullable()
      table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE').notNullable()

      table.timestamp('created_at')

      table.unique(['payment_id', 'registration_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
