import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'tables'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('non_numbered_only').defaultTo(false).notNullable()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('non_numbered_only')
        })
    }
}
