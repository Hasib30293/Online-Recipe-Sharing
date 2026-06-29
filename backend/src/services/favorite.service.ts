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

  return prisma.$transaction(async (tx) => {
    const existing = await tx.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    })

    const favorite = existing ?? await tx.favorite.create({ data: { userId, recipeId } })
    const saveCount = await tx.favorite.count({ where: { recipeId } })

    await tx.recipe.update({
      where: { id: recipeId },
      data: { likesCount: saveCount },
    })

    return favorite
  })
}

export async function removeFavorite(userId: string, recipeId: string) {
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.favorite.deleteMany({ where: { userId, recipeId } })
    if (deleted.count === 0) return

    const saveCount = await tx.favorite.count({ where: { recipeId } })
    await tx.recipe.update({
      where: { id: recipeId },
      data: { likesCount: saveCount },
    })
  })
}

export async function getFavoriteRecipes(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { recipe: { select: recipeSelect } },
    orderBy: { createdAt: 'desc' },
  })
  return favorites.map((f: { recipe: any }) => f.recipe)
}
