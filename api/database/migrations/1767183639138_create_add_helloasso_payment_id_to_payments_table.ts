import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // HelloAsso payment ID (from webhook Order.payments[].id)
      // Required for refund API calls
      table.string('helloasso_payment_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('helloasso_payment_id')
    })
  }
}
