import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export interface TournamentOptions {
  refundDeadline: string | null // ISO date string
  waitlistTimerHours: number
}

export default class Tournament extends BaseModel {
  static defaultOptions: TournamentOptions = {
    refundDeadline: null,
    waitlistTimerHours: 4,
  }

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

  @column({
    prepare: (value: TournamentOptions) => JSON.stringify(value),
    consume: (value: string | TournamentOptions): TournamentOptions => {
      if (typeof value === 'string') {
        return JSON.parse(value) as TournamentOptions
      }
      return value
    },
  })
  declare options: TournamentOptions

  @column()
  declare shortDescription: string | null

  @column()
  declare longDescription: string | null

  @column()
  declare rulesLink: string | null

  @column()
  declare rulesContent: string | null

  @column()
  declare ffttHomologationLink: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
