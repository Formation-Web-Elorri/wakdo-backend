import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import Produit from '#models/produit'
import Categorie from '#models/categorie'
import { produitValidator } from '#validators/produit'

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

  async adminIndex({ view, auth }: HttpContext) {
    const produits = await Produit.query().preload('categorie').orderBy('nom')

    return view.render('admin/produits/index', { produits, user: auth.user })
  }

  async create({ view, auth }: HttpContext) {
    const categories = await Categorie.query().orderBy('nom')

    return view.render('admin/produits/create', { categories, user: auth.user })
  }

  async store({ request, response, session }: HttpContext) {
    let donnees
    try {
      donnees = await request.validateUsing(produitValidator)
    } catch (error) {
      session.flashAll()
      session.flash('erreursValidation', error.messages)
      return response.redirect().back()
    }

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
      nom: donnees.nom,
      description: donnees.description ?? null,
      prix: donnees.prix,
      categorieId: donnees.categorieId,
      disponible,
      image: imagePath,
    })

    return response.redirect('/admin/produits')
  }

  async edit({ params, view, auth }: HttpContext) {
    const produit = await Produit.findOrFail(params.id)
    const categories = await Categorie.query().orderBy('nom')

    return view.render('admin/produits/edit', { produit, categories, user: auth.user })
  }

  async update({ params, request, response, session }: HttpContext) {
    const produit = await Produit.findOrFail(params.id)

    let donnees
    try {
      donnees = await request.validateUsing(produitValidator)
    } catch (error) {
      session.flashAll()
      session.flash('erreursValidation', error.messages)
      return response.redirect().back()
    }

    produit.nom = donnees.nom
    produit.description = donnees.description ?? null
    produit.prix = donnees.prix
    produit.categorieId = donnees.categorieId
    produit.disponible = request.input('disponible') === 'on'

    const imageFile = request.file('image', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (imageFile) {
      const nomFichier = `${cuid()}.${imageFile.extname}`
      await imageFile.move(app.publicPath('uploads/produits'), {
        name: nomFichier,
      })
      const baseUrl = `${request.protocol()}://${request.header('host')}`
      produit.image = `${baseUrl}/uploads/produits/${nomFichier}`
    }

    await produit.save()

    return response.redirect('/admin/produits')
  }

  async destroy({ params, response }: HttpContext) {
    const produit = await Produit.findOrFail(params.id)
    await produit.delete()

    return response.redirect('/admin/produits')
  }
}
