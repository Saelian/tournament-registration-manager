import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import TournamentPlayer from '#models/tournament_player'

export interface FAQItem {
  id: string
  question: string
  answer: string
  order: number
}

export interface TournamentOptions {
  refundDeadline: string | null // ISO date string
  waitlistTimerHours: number
  registrationStartDate: string | null // ISO date string
  registrationEndDate: string | null // ISO date string
  faqItems?: FAQItem[]
}

/**
 * Statut calculé de la période d'inscription
 */
export type RegistrationPeriodStatus = 'not_started' | 'open' | 'closed'

export interface RegistrationPeriodInfo {
  status: RegistrationPeriodStatus
  isOpen: boolean
  relevantDate: string | null // Date d'ouverture (si not_started) ou de fermeture (si open/closed)
  message: string
}

export default class Tournament extends BaseModel {
  static defaultOptions: TournamentOptions = {
    refundDeadline: null,
    waitlistTimerHours: 4,
    registrationStartDate: null,
    registrationEndDate: null,
    faqItems: [],
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

  @hasMany(() => TournamentPlayer)
  declare tournamentPlayers: HasMany<typeof TournamentPlayer>
}
