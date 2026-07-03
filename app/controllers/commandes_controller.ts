import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Commande from '#models/commande'
import LigneCommande from '#models/ligne_commande'
import LigneCommandeOption from '#models/ligne_commande_option'
import Produit from '#models/produit'
import { creerCommandeValidator } from '#validators/commande'

const TAILLES_MENU: Record<string, { nom: string; supplement: number }> = {
  'best-of': { nom: 'Menu Best Of', supplement: 0 },
  'maxi-best-of': { nom: 'Menu Maxi Best Of', supplement: 1.5 },
}

const ACCOMPAGNEMENTS: Record<string, { nom: string; supplement: number }> = {
  frites: { nom: 'Frites', supplement: 0 },
  potatoes: { nom: 'Potatoes', supplement: 0.5 },
  salade: { nom: 'Salade', supplement: 0 },
}

const SAUCES: Record<string, { nom: string; supplement: number }> = {
  'barbecue': { nom: 'Classic Barbecue', supplement: 0 },
  'moutarde': { nom: 'Classic Moutarde', supplement: 0 },
  'creamy-deluxe': { nom: 'Creamy Deluxe', supplement: 0 },
  'ketchup': { nom: 'Ketchup', supplement: 0 },
  'chinoise': { nom: 'Chinoise', supplement: 0 },
  'curry': { nom: 'Curry', supplement: 0 },
  'pommes-frites': { nom: 'Pommes Frites', supplement: 0 },
}

const TAILLES_BOISSON: Record<string, { nom: string; supplement: number }> = {
  'best-of': { nom: '30 cl', supplement: 0 },
  'maxi': { nom: '50 cl', supplement: 0.5 },
}

export default class CommandesController {
  async store({ request, response }: HttpContext) {
    const donnees = await request.validateUsing(creerCommandeValidator)

    const resultat = await db.transaction(async (trx) => {
      const commande = await Commande.create(
        {
          numeroCommande: donnees.numeroCommande,
          numeroTable: donnees.numeroTable,
          type: donnees.type,
          statut: 'en_attente',
          total: donnees.total,
        },
        { client: trx }
      )

      for (const article of donnees.articles) {
        const produitExistant = await Produit.findBy('nom', article.nom)

        const ligne = await LigneCommande.create(
          {
            commandeId: commande.id,
            produitId: produitExistant?.id ?? null,
            nomProduit: article.nom,
            prixUnitaire: article.prixUnitaire,
            quantite: article.quantite,
          },
          { client: trx }
        )

        if (article.options && article.options.length > 0) {
          for (const libelle of article.options) {
            await LigneCommandeOption.create(
              { ligneCommandeId: ligne.id, libelle, supplement: 0 },
              { client: trx }
            )
          }
        }
      }

      return commande
    })

    return response.created({ id: resultat.id, numeroCommande: resultat.numeroCommande })
  }

  async index({ response }: HttpContext) {
    const commandes = await Commande.query()
      .preload('lignes', (q) => q.preload('options'))
      .orderBy('createdAt', 'asc')

    return response.ok(commandes)
  }

  async adminIndex({ view, auth }: HttpContext) {
    const commandes = await Commande.query()
      .preload('lignes', (q) => q.preload('options'))
      .orderBy('createdAt', 'asc')

    return view.render('admin/commandes/index', { commandes, user: auth.user })
  }

  async marquerPreparee({ params, response }: HttpContext) {
    const commande = await Commande.findOrFail(params.id)
    commande.statut = 'preparee'
    await commande.save()

    return response.redirect('/admin/commandes')
  }

  async marquerLivree({ params, response }: HttpContext) {
    const commande = await Commande.findOrFail(params.id)
    commande.statut = 'livree'
    await commande.save()

    return response.redirect('/admin/commandes')
  }

  async nouvelle({ view }: HttpContext) {
    const produits = await Produit.query()
      .where('disponible', true)
      .preload('categorie')
      .orderBy('nom')

    const menus = produits.filter((p) => p.categorie.nom === 'menus')
    const boissons = produits.filter((p) => p.categorie.nom === 'boissons')
    const autres = produits.filter(
      (p) => p.categorie.nom !== 'menus' && p.categorie.nom !== 'boissons'
    )

    return view.render('admin/commandes/nouvelle', { menus, boissons, autres })
  }

  async enregistrerManuelle({ request, response }: HttpContext) {
    const numeroCommande = request.input('numeroCommande')
    const numeroTable = request.input('numeroTable')
    const type = request.input('type')

    const produits = await Produit.query().where('disponible', true).preload('categorie')
    const menus = produits.filter((p) => p.categorie.nom === 'menus')
    const boissons = produits.filter((p) => p.categorie.nom === 'boissons')
    const autres = produits.filter(
      (p) => p.categorie.nom !== 'menus' && p.categorie.nom !== 'boissons'
    )

    await db.transaction(async (trx) => {
      let total = 0

      const commande = await Commande.create(
        {
          numeroCommande,
          numeroTable,
          type,
          statut: 'en_attente',
          total: 0,
        },
        { client: trx }
      )

      const creerLigne = async (
        nomProduit: string,
        prixUnitaire: number,
        quantite: number,
        produitId: number | null,
        options: string[]
      ) => {
        total += prixUnitaire * quantite

        const ligne = await LigneCommande.create(
          { commandeId: commande.id, produitId, nomProduit, prixUnitaire, quantite },
          { client: trx }
        )

        for (const libelle of options) {
          await LigneCommandeOption.create(
            { ligneCommandeId: ligne.id, libelle, supplement: 0 },
            { client: trx }
          )
        }
      }

      for (const produit of autres) {
        const quantite = Number(request.input(`quantite_${produit.id}`, 0))
        if (quantite > 0) {
          await creerLigne(produit.nom, produit.prix, quantite, produit.id, [])
        }
      }

      for (const produit of menus) {
        const quantite = Number(request.input(`menu_${produit.id}_quantite`, 0))
        if (quantite > 0) {
          const tailleId = request.input(`menu_${produit.id}_taille`, 'best-of')
          const accompagnementId = request.input(`menu_${produit.id}_accompagnement`, 'frites')
          const sauceId = request.input(`menu_${produit.id}_sauce`, 'barbecue')
          const boissonId = request.input(`menu_${produit.id}_boisson`)

          const taille = TAILLES_MENU[tailleId] ?? TAILLES_MENU['best-of']
          const accompagnement = ACCOMPAGNEMENTS[accompagnementId] ?? ACCOMPAGNEMENTS['frites']
          const sauce = SAUCES[sauceId] ?? SAUCES['barbecue']
          const boisson = boissons.find((b) => String(b.id) === String(boissonId))

          const supplement = taille.supplement + accompagnement.supplement + sauce.supplement
          const prixUnitaire = produit.prix + supplement

          const options = [taille.nom, accompagnement.nom, sauce.nom, boisson?.nom].filter(
            (v): v is string => Boolean(v)
          )

          await creerLigne(produit.nom, prixUnitaire, quantite, produit.id, options)
        }
      }

      for (const produit of boissons) {
        const quantite = Number(request.input(`boisson_${produit.id}_quantite`, 0))
        if (quantite > 0) {
          const tailleId = request.input(`boisson_${produit.id}_taille`, 'best-of')
          const taille = TAILLES_BOISSON[tailleId] ?? TAILLES_BOISSON['best-of']
          const prixUnitaire = produit.prix + taille.supplement

          await creerLigne(produit.nom, prixUnitaire, quantite, produit.id, [taille.nom])
        }
      }

      commande.total = total
      await commande.save()
    })

    return response.redirect('/admin/commandes')
  }
}
