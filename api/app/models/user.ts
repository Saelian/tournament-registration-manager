import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Player from '#models/player'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
    uids: ['email'],
    passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare fullName: string | null

    @column()
    declare firstName: string | null

    @column()
    declare lastName: string | null

    @column()
    declare phone: string | null

    @column()
    declare email: string

    @column({ serializeAs: null })
    declare password: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    @hasMany(() => Player)
    declare players: HasMany<typeof Player>

    @computed()
    get isProfileComplete(): boolean {
        return Boolean(this.firstName && this.lastName && this.phone)
    }
}
