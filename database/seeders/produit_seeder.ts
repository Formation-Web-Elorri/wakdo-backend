import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { readFileSync } from 'node:fs'
import Produit from '#models/produit'
import Categorie from '#models/categorie'

export default class extends BaseSeeder {
  async run() {
    const jsonPath = new URL('../data/produits.json', import.meta.url)
    const produitsParCategorie: Record<string, any[]> = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    for (const [nomCategorie, produits] of Object.entries(produitsParCategorie)) {
      const categorie = await Categorie.findByOrFail('nom', nomCategorie)

      for (const p of produits) {
        await Produit.updateOrCreate(
          { nom: p.nom, categoryId: categorie.id },
          {
            nom: p.nom,
            prix: p.prix,
            image: p.image,
            disponible: true,
            categoryId: categorie.id,
          }
        )
      }
    }
  }
}
