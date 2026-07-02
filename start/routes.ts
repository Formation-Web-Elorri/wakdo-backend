import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ProduitsController = () => import('#controllers/produits_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const CommandesController = () => import('#controllers/commandes_controller')
const SessionController = () => import('#controllers/session_controller')

// Routes API existantes, pour le front client
router.get('/api/produits', [ProduitsController, 'index'])
router.get('/api/categories', [CategoriesController, 'index'])
router.post('/api/commandes', [CommandesController, 'store'])
router.get('/api/commandes', [CommandesController, 'index'])

// Authentification
router.get('/login', [SessionController, 'showLogin'])
router.post('/login', [SessionController, 'login'])
router.post('/logout', [SessionController, 'logout'])

// Routes admin, protégées par connexion
router
  .group(() => {
    router
      .get('/produits', [ProduitsController, 'adminIndex'])
      .use(middleware.role({ roles: ['administration'] }))
  })
  .prefix('/admin')
  .use(middleware.auth())
