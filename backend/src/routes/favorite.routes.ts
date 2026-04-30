import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { requireAuth } from '../middlewares/auth.middleware'
import * as favoriteController from '../controllers/favorite.controller'

const router = Router()

router.get('/', requireAuth, asyncHandler(favoriteController.getFavorites))
router.get('/recipes', requireAuth, asyncHandler(favoriteController.getFavoriteRecipes))
router.post('/:recipeId', requireAuth, asyncHandler(favoriteController.addFavorite))
router.delete('/:recipeId', requireAuth, asyncHandler(favoriteController.removeFavorite))

export default router
