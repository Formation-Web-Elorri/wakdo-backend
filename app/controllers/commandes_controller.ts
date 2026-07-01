import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Commande from '#models/commande'
import LigneCommande from '#models/ligne_commande'
import LigneCommandeOption from '#models/ligne_commande_option'
import Produit from '#models/produit'
import { creerCommandeValidator } from '#validators/commande'

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
}
