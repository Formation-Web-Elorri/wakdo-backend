import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lignes_commande'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('commande_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('commandes')
        .onDelete('CASCADE')

      table
        .integer('produit_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('produits')
        .onDelete('SET NULL')

      table.string('nom_produit', 150).notNullable()
      table.decimal('prix_unitaire', 6, 2).notNullable()
      table.integer('quantite').unsigned().notNullable().defaultTo(1)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
