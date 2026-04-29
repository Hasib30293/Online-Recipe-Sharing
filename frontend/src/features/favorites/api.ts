import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { Recipe } from '@/features/recipes/types'

export const favoriteKeys = {
  all: ['favorites'] as const,
  recipes: () => [...favoriteKeys.all, 'recipes'] as const,
}

export function useFavorites() {
  return useQuery({
    queryKey: favoriteKeys.all,
    queryFn: async () => {
      const res = await api.get<ApiResponse<string[]>>('/favorites')
      return res.data.data
    },
  })
}

export function useFavoriteRecipes() {
  return useQuery({
    queryKey: favoriteKeys.recipes(),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Recipe[]>>('/favorites/recipes')
      return res.data.data
    },
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ recipeId, isFavorited }: { recipeId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await api.delete(`/favorites/${recipeId}`)
      } else {
        await api.post(`/favorites/${recipeId}`)
      }
      return { recipeId, newState: !isFavorited }
    },
    onMutate: async ({ recipeId, isFavorited }) => {
      await qc.cancelQueries({ queryKey: favoriteKeys.all })
      const previous = qc.getQueryData<string[]>(favoriteKeys.all)
      qc.setQueryData<string[]>(favoriteKeys.all, (old = []) =>
        isFavorited ? old.filter((id) => id !== recipeId) : [...old, recipeId],
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(favoriteKeys.all, context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: favoriteKeys.all })
    },
  })
}
