import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'registrations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.integer('player_id').unsigned().references('id').inTable('players').onDelete('CASCADE').notNullable()
      table.integer('table_id').unsigned().references('id').inTable('tables').onDelete('CASCADE').notNullable()
      
      table.string('status').notNullable().defaultTo('pending_payment')
      table.integer('waitlist_rank').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}