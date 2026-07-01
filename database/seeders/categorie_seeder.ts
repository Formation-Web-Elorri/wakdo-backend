import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { readFileSync } from 'node:fs'
import Categorie from '#models/categorie'

export default class extends BaseSeeder {
  async run() {
    const jsonPath = new URL('../data/categories.json', import.meta.url)
    const categories = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    for (const cat of categories) {
      await Categorie.updateOrCreate({ nom: cat.title }, { nom: cat.title, image: cat.image })
    }
  }
}
