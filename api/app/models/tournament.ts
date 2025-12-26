import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Tournament extends BaseModel {
  static defaultWaitlistTimerHours = 4

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare location: string

  @column.date()
  declare refundDeadline: DateTime | null

  @column()
  declare waitlistTimerHours: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}