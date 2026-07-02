import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class SessionController {
  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async login({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect('/admin/produits')
    } catch {
      session.flash('erreur', 'Email ou mot de passe incorrect')
      return response.redirect('/login')
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
