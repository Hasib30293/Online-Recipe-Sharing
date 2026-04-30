import prisma from '../prisma/client'
import { AppError } from '../utils/AppError'
import { recipeSelect } from './recipe.service'

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { recipeId: true },
  })
  return favorites.map((f: { recipeId: any }) => f.recipeId)
}

export async function addFavorite(userId: string, recipeId: string) {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
  if (!recipe) throw new AppError('Recipe not found', 404, 'NOT_FOUND')

  // Upsert — no 409 if already exists
  return prisma.favorite.upsert({
    where: { userId_recipeId: { userId, recipeId } },
    create: { userId, recipeId },
    update: {},
  })
}

export async function removeFavorite(userId: string, recipeId: string) {
  await prisma.favorite.deleteMany({ where: { userId, recipeId } })
}

export async function getFavoriteRecipes(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { recipe: { select: recipeSelect } },
    orderBy: { createdAt: 'desc' },
  })
  return favorites.map((f: { recipe: any }) => f.recipe)
}
