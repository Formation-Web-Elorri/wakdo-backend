import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
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
    const description = request.input('description')
    const prix = request.input('prix')
    const categorieId = request.input('categorieId')
    const disponible = request.input('disponible') === 'on'

    const imageFile = request.file('image', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    let imagePath: string | null = null

    if (imageFile) {
      const nomFichier = `${cuid()}.${imageFile.extname}`
      await imageFile.move(app.publicPath('uploads/produits'), {
        name: nomFichier,
      })
      const baseUrl = `${request.protocol()}://${request.header('host')}`
      imagePath = `${baseUrl}/uploads/produits/${nomFichier}`
    }

    await Produit.create({
      nom,
      description,
      prix,
      categorieId,
      disponible,
      image: imagePath,
    })

    return response.redirect('/admin/produits')
  }
}
