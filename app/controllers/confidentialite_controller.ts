import type { HttpContext } from '@adonisjs/core/http'

export default class ConfidentialiteController {
  async index({ view }: HttpContext) {
    return view.render('confidentialite')
  }
}
