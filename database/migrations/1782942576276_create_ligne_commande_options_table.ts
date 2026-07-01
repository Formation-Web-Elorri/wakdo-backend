import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ligne_commande_options'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('ligne_commande_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('lignes_commande')
        .onDelete('CASCADE')

      table.string('libelle', 100).notNullable()
      table.decimal('supplement', 6, 2).notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
