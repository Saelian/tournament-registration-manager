import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'table_prizes'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('table_id').unsigned().references('id').inTable('tables').onDelete('CASCADE').notNullable()
            table.integer('rank').notNullable()
            table.enum('prize_type', ['cash', 'item']).notNullable()
            table.decimal('cash_amount', 10, 2).nullable()
            table.string('item_description').nullable()
            table.timestamp('created_at')
            table.timestamp('updated_at')

            table.unique(['table_id', 'rank'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
