import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'tables'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.integer('tournament_id').unsigned().references('id').inTable('tournaments').onDelete('CASCADE')
            table.string('name').notNullable()
            table.date('date').notNullable()
            table.time('start_time').notNullable()
            table.integer('points_min').notNullable()
            table.integer('points_max').notNullable()
            table.integer('quota').notNullable()
            table.integer('price').notNullable() // Storing in cents or base unit
            table.boolean('is_special').defaultTo(false)

            table.timestamp('created_at')
            table.timestamp('updated_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
