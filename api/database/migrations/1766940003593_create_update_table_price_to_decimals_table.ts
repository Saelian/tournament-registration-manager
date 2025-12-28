import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tables'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('price_new', 10, 2).notNullable().defaultTo(0)
    })

    // Migrate data: divide cents by 100 to get euros
    this.defer(async (db) => {
      await db.rawQuery('UPDATE tables SET price_new = price / 100.0')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('price')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('price_new', 'price')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('price_old').notNullable().defaultTo(0)
    })

    // Revert: multiply euros by 100 to get cents
    this.defer(async (db) => {
      await db.rawQuery('UPDATE tables SET price_old = ROUND(price * 100)')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('price')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('price_old', 'price')
    })
  }
}
