import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tournaments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('phase').notNullable().defaultTo('before')
      table.string('event_result_url', 2048).nullable()
      table.text('event_content').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('phase')
      table.dropColumn('event_result_url')
      table.dropColumn('event_content')
    })
  }
}
