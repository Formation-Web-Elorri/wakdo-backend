import vine from '@vinejs/vine'

export const creerCommandeValidator = vine.compile(
  vine.object({
    type: vine.enum(['sur_place', 'a_emporter']),
    numeroTable: vine.string().trim(),
    numeroCommande: vine.string().trim(),
    total: vine.number().positive(),
    articles: vine.array(
      vine.object({
        nom: vine.string().trim(),
        quantite: vine.number().positive(),
        prixUnitaire: vine.number().positive(),
        options: vine.array(vine.string().trim()).optional(),
      })
    ),
  })
)
