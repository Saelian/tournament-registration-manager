import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'table_sponsors'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('table_id').unsigned().references('id').inTable('tables').onDelete('CASCADE').notNullable()
            table
                .integer('sponsor_id')
                .unsigned()
                .references('id')
                .inTable('sponsors')
                .onDelete('CASCADE')
                .notNullable()
            table.timestamp('created_at')

            table.unique(['table_id', 'sponsor_id'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
