import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'players'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      
      table.string('licence').notNullable().unique()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('club').notNullable()
      table.integer('points').notNullable()
      table.string('sex').nullable()
      table.string('category').nullable()
      table.boolean('needs_verification').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}