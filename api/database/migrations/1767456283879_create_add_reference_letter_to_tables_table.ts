import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'tables'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('reference_letter', 5).nullable()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('reference_letter')
        })
    }
}
