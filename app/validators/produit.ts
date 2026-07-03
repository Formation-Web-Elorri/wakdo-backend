import vine from '@vinejs/vine'

export const produitValidator = vine.compile(
  vine.object({
    nom: vine.string().trim().minLength(2).maxLength(150),
    description: vine.string().trim().optional(),
    prix: vine.number().positive(),
    categorieId: vine.number(),
  })
)
