import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tournament from '#models/tournament'
import Registration from '#models/registration'

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @hasMany(() => Registration)
  declare registrations: HasMany<typeof Registration>
}
