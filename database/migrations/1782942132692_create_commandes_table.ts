import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'commandes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('numero_commande', 10).notNullable()
      table.string('numero_table', 10).nullable()
      table.enum('type', ['sur_place', 'a_emporter']).notNullable().defaultTo('sur_place')
      table
        .enum('statut', ['en_attente', 'en_preparation', 'preparee', 'livree'])
        .notNullable()
        .defaultTo('en_attente')
      table.decimal('total', 6, 2).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
