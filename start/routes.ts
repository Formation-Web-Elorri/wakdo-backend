import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ProduitsController = () => import('#controllers/produits_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const CommandesController = () => import('#controllers/commandes_controller')
const SessionController = () => import('#controllers/session_controller')
const UsersController = () => import('#controllers/users_controller')
const ConfidentialiteController = () => import('#controllers/confidentialite_controller')

// Routes API existantes, pour le front client
router.get('/api/produits', [ProduitsController, 'index'])
router.get('/api/categories', [CategoriesController, 'index'])
router.post('/api/commandes', [CommandesController, 'store'])
router.get('/api/commandes', [CommandesController, 'index'])
router.get('/confidentialite', [ConfidentialiteController, 'index'])

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

    router
      .get('/produits/nouveau', [ProduitsController, 'create'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .post('/produits', [ProduitsController, 'store'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .get('/produits/:id/modifier', [ProduitsController, 'edit'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .post('/produits/:id/modifier', [ProduitsController, 'update'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .post('/produits/:id/supprimer', [ProduitsController, 'destroy'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .get('/commandes', [CommandesController, 'adminIndex'])
      .use(middleware.role({ roles: ['preparation', 'accueil', 'administration'] }))

    router
      .post('/commandes/:id/preparer', [CommandesController, 'marquerPreparee'])
      .use(middleware.role({ roles: ['preparation', 'administration'] }))

    router
      .post('/commandes/:id/livrer', [CommandesController, 'marquerLivree'])
      .use(middleware.role({ roles: ['accueil', 'administration'] }))

    router
      .get('/commandes/nouvelle', [CommandesController, 'nouvelle'])
      .use(middleware.role({ roles: ['accueil', 'administration'] }))

    router
      .post('/commandes', [CommandesController, 'enregistrerManuelle'])
      .use(middleware.role({ roles: ['accueil', 'administration'] }))

    router
      .get('/utilisateurs', [UsersController, 'index'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .get('/utilisateurs/nouveau', [UsersController, 'create'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .post('/utilisateurs', [UsersController, 'store'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .get('/utilisateurs/:id/modifier', [UsersController, 'edit'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .post('/utilisateurs/:id/modifier', [UsersController, 'update'])
      .use(middleware.role({ roles: ['administration'] }))

    router
      .post('/utilisateurs/:id/supprimer', [UsersController, 'destroy'])
      .use(middleware.role({ roles: ['administration'] }))
  })
  .prefix('/admin')
  .use(middleware.auth())
