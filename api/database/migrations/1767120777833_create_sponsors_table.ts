import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'sponsors'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('tournament_id')
                .unsigned()
                .references('id')
                .inTable('tournaments')
                .onDelete('CASCADE')
                .notNullable()
            table.string('name').notNullable()
            table.string('website_url').nullable()
            table.string('contact_email').nullable()
            table.text('description').nullable()
            table.boolean('is_global').defaultTo(false)
            table.timestamp('created_at')
            table.timestamp('updated_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
