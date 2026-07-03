import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  async index({ view, auth }: HttpContext) {
    const users = await User.query().orderBy('fullName')

    return view.render('admin/users/index', { users, user: auth.user })
  }

  async create({ view, auth }: HttpContext) {
    return view.render('admin/users/create', { user: auth.user })
  }

  async store({ request, response }: HttpContext) {
    const fullName = request.input('fullName')
    const email = request.input('email')
    const password = request.input('password')
    const role = request.input('role')

    await User.create({ fullName, email, password, role })

    return response.redirect('/admin/utilisateurs')
  }

  async edit({ params, view, auth }: HttpContext) {
    const utilisateur = await User.findOrFail(params.id)

    return view.render('admin/users/edit', { utilisateur, user: auth.user })
  }

  async update({ params, request, response }: HttpContext) {
    const utilisateur = await User.findOrFail(params.id)

    utilisateur.fullName = request.input('fullName')
    utilisateur.email = request.input('email')
    utilisateur.role = request.input('role')

    const nouveauMotDePasse = request.input('password')
    if (nouveauMotDePasse) {
      utilisateur.password = nouveauMotDePasse
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
