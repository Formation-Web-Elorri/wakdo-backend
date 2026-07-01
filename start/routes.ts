import router from '@adonisjs/core/services/router'
const ProduitsController = () => import('#controllers/produits_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const CommandesController = () => import('#controllers/commandes_controller')

router.get('/api/produits', [ProduitsController, 'index'])
router.get('/api/categories', [CategoriesController, 'index'])
router.post('/api/commandes', [CommandesController, 'store'])
router.get('/api/commandes', [CommandesController, 'index'])
