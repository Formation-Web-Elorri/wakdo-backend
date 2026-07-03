import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Force uniquement les routes de l'API a repondre en JSON.
 * Les routes admin gardent un comportement HTML normal.
 */
export default class ForceJsonResponseMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    if (request.url().startsWith('/api')) {
      const headers = request.headers()
      headers.accept = 'application/json'
    }

    return next()
  }
}
