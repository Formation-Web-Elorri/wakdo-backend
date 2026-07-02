import type { HttpContext } from '@adonisjs/core/http'
import Produit from '#models/produit'
import Categorie from '#models/categorie'

export default class ProduitsController {
  async index({ request, response }: HttpContext) {
    const categorieNom = request.input('categorie')

    const query = Produit.query().where('disponible', true).preload('categorie')

    if (categorieNom) {
      const categorie = await Categorie.findBy('nom', categorieNom)
      if (!categorie) {
        return response.ok([])
      }
      query.where('categorieId', categorie.id)
    }

    const produits = await query
    return response.ok(produits)
  }
}
