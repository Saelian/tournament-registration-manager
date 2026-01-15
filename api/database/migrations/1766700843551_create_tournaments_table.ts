import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'tournaments'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')

            table.string('name').notNullable()
            table.date('start_date').notNullable()
            table.date('end_date').notNullable()
            table.string('location').notNullable()
            table.date('refund_deadline').nullable()
            table.integer('waitlist_timer_hours').notNullable().defaultTo(4)

            table.timestamp('created_at')
            table.timestamp('updated_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
