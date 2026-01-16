import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'registrations'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.timestamp('promoted_at', { useTz: true }).nullable()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('promoted_at')
        })
    }
}
