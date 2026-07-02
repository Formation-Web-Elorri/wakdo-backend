import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Categorie from '#models/categorie'

export default class Produit extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string

  @column()
  declare description: string | null

  @column()
  declare prix: number

  @column()
  declare image: string | null

  @column()
  declare disponible: boolean

  @column({ columnName: 'category_id' })
  declare categorieId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Categorie)
  declare categorie: BelongsTo<typeof Categorie>
}
