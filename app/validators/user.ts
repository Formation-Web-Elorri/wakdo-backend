import vine from '@vinejs/vine'

export const creerUtilisateurValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
    email: vine.string().trim().email(),
    password: vine.string().minLength(8),
    role: vine.enum(['administration', 'preparation', 'accueil']),
  })
)

export const modifierUtilisateurValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
    email: vine.string().trim().email(),
    password: vine.string().minLength(8).optional(),
    role: vine.enum(['administration', 'preparation', 'accueil']),
  })
)
