import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LigneCommande from '#models/ligne_commande'

export default class LigneCommandeOption extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'ligne_commande_id' })
  declare ligneCommandeId: number

  @column()
  declare libelle: string

  @column()
  declare supplement: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => LigneCommande)
  declare ligneCommande: BelongsTo<typeof LigneCommande>
}
