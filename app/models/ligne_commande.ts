import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Commande from '#models/commande'
import Produit from '#models/produit'
import LigneCommandeOption from '#models/ligne_commande_option'

export default class LigneCommande extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'commande_id' })
  declare commandeId: number

  @column({ columnName: 'produit_id' })
  declare produitId: number | null

  @column({ columnName: 'nom_produit' })
  declare nomProduit: string

  @column({ columnName: 'prix_unitaire' })
  declare prixUnitaire: number

  @column()
  declare quantite: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Commande)
  declare commande: BelongsTo<typeof Commande>

  @belongsTo(() => Produit)
  declare produit: BelongsTo<typeof Produit>

  @hasMany(() => LigneCommandeOption)
  declare options: HasMany<typeof LigneCommandeOption>
}
