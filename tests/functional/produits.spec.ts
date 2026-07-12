import { test } from '@japa/runner'

test.group('API Produits', () => {
  test('GET /api/produits renvoie une liste', async ({ client, assert }) => {
    const response = await client.get('/api/produits')
    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('GET /api/categories renvoie une liste', async ({ client, assert }) => {
    const response = await client.get('/api/categories')
    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('GET /api/produits/inconnue renvoie une erreur', async ({ client }) => {
    const response = await client.get('/api/produits-inexistant')
    response.assertStatus(404)
  })
})
