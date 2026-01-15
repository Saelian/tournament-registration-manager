import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'players'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.float('points').alter()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('points').alter()
        })
    }
}
