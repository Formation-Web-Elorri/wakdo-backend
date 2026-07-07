import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import LigneCommande from '#models/ligne_commande'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Commande extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'numero_commande' })
  declare numeroCommande: string

  @column({ columnName: 'numero_table' })
  declare numeroTable: string | null

  @column()
  declare type: 'sur_place' | 'a_emporter'

  @column()
  declare statut: 'en_attente' | 'en_preparation' | 'preparee' | 'livree'

  @column()
  declare total: number

  @column()
  declare userId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => LigneCommande)
  declare lignes: HasMany<typeof LigneCommande>

  @belongsTo(() => User)
  declare utilisateur: BelongsTo<typeof User>
}
