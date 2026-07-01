import type { HttpContext } from '@adonisjs/core/http'
import Categorie from '#models/categorie'

export default class CategoriesController {
  async index({ response }: HttpContext) {
    const categories = await Categorie.query().preload('produits')
    return response.ok(categories)
  }
}
