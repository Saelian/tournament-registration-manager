import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tables'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Gender restriction: NULL = all, 'M' = men only, 'F' = women only
      table.string('gender_restriction', 1).nullable()
      table.check(
        "gender_restriction IS NULL OR gender_restriction IN ('M', 'F')",
        [],
        'check_gender_restriction'
      )

      // Allowed categories: JSONB array of FFTT category strings
      table.jsonb('allowed_categories').nullable()

      // Maximum check-in time before table starts
      table.time('max_checkin_time').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropChecks(['check_gender_restriction'])
      table.dropColumn('gender_restriction')
      table.dropColumn('allowed_categories')
      table.dropColumn('max_checkin_time')
    })
  }
}
