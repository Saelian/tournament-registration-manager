import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Tournament from '#models/tournament'
import Registration from '#models/registration'
import TablePrize from '#models/table_prize'
import Sponsor from '#models/sponsor'
import type { GenderRestriction, FfttCategory } from '#constants/fftt'

export default class Table extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tournamentId: number

  @column()
  declare name: string

  @column.date()
  declare date: DateTime

  @column()
  declare startTime: string

  @column()
  declare pointsMin: number

  @column()
  declare pointsMax: number

  @column()
  declare quota: number

  @column()
  declare price: number

  @column()
  declare isSpecial: boolean

  @column()
  declare genderRestriction: GenderRestriction

  @column({
    prepare: (value: FfttCategory[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | FfttCategory[] | null): FfttCategory[] | null => {
      if (typeof value === 'string') {
        return JSON.parse(value) as FfttCategory[]
      }
      return value
    },
  })
  declare allowedCategories: FfttCategory[] | null

  @column()
  declare maxCheckinTime: string | null

  @column()
  declare nonNumberedOnly: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @hasMany(() => Registration)
  declare registrations: HasMany<typeof Registration>

  @hasMany(() => TablePrize)
  declare prizes: HasMany<typeof TablePrize>

  @manyToMany(() => Sponsor, {
    pivotTable: 'table_sponsors',
    pivotTimestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  })
  declare sponsors: ManyToMany<typeof Sponsor>

  @computed()
  get totalCashPrize(): number {
    if (!this.prizes) return 0
    return this.prizes
      .filter((p) => p.prizeType === 'cash' && p.cashAmount !== null)
      .reduce((sum, p) => sum + (p.cashAmount ?? 0), 0)
  }
}
