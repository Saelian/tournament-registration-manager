import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('payment_method', ['helloasso', 'cash', 'check', 'card']).notNullable().defaultTo('helloasso')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('payment_method')
    })
  }
}
