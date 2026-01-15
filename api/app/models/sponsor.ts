import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Tournament from '#models/tournament'
import Table from '#models/table'

export default class Sponsor extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare tournamentId: number

    @column()
    declare name: string

    @column()
    declare websiteUrl: string | null

    @column()
    declare contactEmail: string | null

    @column()
    declare description: string | null

    @column()
    declare isGlobal: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => Tournament)
    declare tournament: BelongsTo<typeof Tournament>

    @manyToMany(() => Table, {
        pivotTable: 'table_sponsors',
        pivotTimestamps: {
            createdAt: 'created_at',
            updatedAt: false,
        },
    })
    declare tables: ManyToMany<typeof Table>
}
