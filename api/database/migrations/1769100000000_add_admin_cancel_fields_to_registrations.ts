import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'registrations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('cancelled_by_admin_id').nullable().references('id').inTable('admins')
      table.string('refund_status').nullable() // 'none' | 'requested' | 'done'
      table.string('refund_method').nullable() // 'cash' | 'check' | 'bank_transfer'
      table.timestamp('refunded_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cancelled_by_admin_id')
      table.dropColumn('refund_status')
      table.dropColumn('refund_method')
      table.dropColumn('refunded_at')
    })
  }
}
