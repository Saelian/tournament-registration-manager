import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'payments'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.timestamp('refunded_at').nullable()
            table.string('refund_method').nullable()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('refunded_at')
            table.dropColumn('refund_method')
        })
    }
}
