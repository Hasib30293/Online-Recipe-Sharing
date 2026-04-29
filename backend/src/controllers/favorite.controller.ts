import { Request, Response } from 'express'
import * as favoriteService from '../services/favorite.service'

export async function getFavorites(req: Request, res: Response): Promise<void> {
  const ids = await favoriteService.getFavoriteIds(req.user!.userId)
  res.json({ success: true, data: ids })
}

export async function addFavorite(req: Request, res: Response): Promise<void> {
  await favoriteService.addFavorite(req.user!.userId, req.params.recipeId)
  res.status(201).json({ success: true, data: null })
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
  await favoriteService.removeFavorite(req.user!.userId, req.params.recipeId)
  res.json({ success: true, data: null })
}

export async function getFavoriteRecipes(req: Request, res: Response): Promise<void> {
  const recipes = await favoriteService.getFavoriteRecipes(req.user!.userId)
  res.json({ success: true, data: recipes })
}
