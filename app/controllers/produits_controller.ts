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

  async adminIndex({ view }: HttpContext) {
    const produits = await Produit.query().preload('categorie').orderBy('nom')

    return view.render('admin/produits/index', { produits })
  }

  async create({ view }: HttpContext) {
    const categories = await Categorie.query().orderBy('nom')

    return view.render('admin/produits/create', { categories })
  }

  async store({ request, response }: HttpContext) {
    const nom = request.input('nom')
    const prix = request.input('prix')
    const categorieId = request.input('categorieId')
    const disponible = request.input('disponible') === 'on'

    await Produit.create({ nom, prix, categorieId, disponible })

    return response.redirect('/admin/produits')
  }
}
