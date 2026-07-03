import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { creerUtilisateurValidator, modifierUtilisateurValidator } from '#validators/user'

export default class UsersController {
  async index({ view, auth }: HttpContext) {
    const users = await User.query().orderBy('fullName')

    return view.render('admin/users/index', { users, user: auth.user })
  }

  async create({ view, auth }: HttpContext) {
    return view.render('admin/users/create', { user: auth.user })
  }

  async store({ request, response, session }: HttpContext) {
    let donnees
    try {
      donnees = await request.validateUsing(creerUtilisateurValidator)
    } catch (error) {
      session.flashAll()
      session.flash('erreursValidation', error.messages)
      return response.redirect().back()
    }

    const emailExistant = await User.findBy('email', donnees.email)
    if (emailExistant) {
      session.flashAll()
      session.flash('erreursValidation', [
        { message: 'Cet email est déjà utilisé par un autre compte.' },
      ])
      return response.redirect().back()
    }

    await User.create(donnees)

    return response.redirect('/admin/utilisateurs')
  }

  async edit({ params, view, auth }: HttpContext) {
    const utilisateur = await User.findOrFail(params.id)

    return view.render('admin/users/edit', { utilisateur, user: auth.user })
  }

  async update({ params, request, response, session }: HttpContext) {
    const utilisateur = await User.findOrFail(params.id)

    let donnees
    try {
      donnees = await request.validateUsing(modifierUtilisateurValidator)
    } catch (error) {
      session.flashAll()
      session.flash('erreursValidation', error.messages)
      return response.redirect().back()
    }

    const emailExistant = await User.query()
      .where('email', donnees.email)
      .whereNot('id', utilisateur.id)
      .first()

    if (emailExistant) {
      session.flashAll()
      session.flash('erreursValidation', [
        { message: 'Cet email est déjà utilisé par un autre compte.' },
      ])
      return response.redirect().back()
    }

    utilisateur.fullName = donnees.fullName
    utilisateur.email = donnees.email
    utilisateur.role = donnees.role

    if (donnees.password) {
      utilisateur.password = donnees.password
    }

    await utilisateur.save()

    return response.redirect('/admin/utilisateurs')
  }

  async destroy({ params, response, auth }: HttpContext) {
    const utilisateur = await User.findOrFail(params.id)

    if (utilisateur.id === auth.user!.id) {
      return response.redirect('/admin/utilisateurs')
    }

    await utilisateur.delete()

    return response.redirect('/admin/utilisateurs')
  }
}
