import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Player extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare licence: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare club: string

  @column()
  declare points: number

  @column()
  declare sex: string | null

  @column()
  declare category: string | null

  @column()
  declare needsVerification: boolean

  @column()
  declare clast: string | null

  @column()
  declare clglob: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
