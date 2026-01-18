import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'registrations'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('admin_id').unsigned().nullable().references('id').inTable('admins').onDelete('SET NULL')
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('admin_id')
        })
    }
}
