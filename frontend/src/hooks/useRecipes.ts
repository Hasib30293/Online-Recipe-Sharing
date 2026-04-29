import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { Recipe } from '@/features/recipes/types'

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes', 'hero'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Recipe[]>>('/recipes', { params: { limit: 10 } })
      return res.data.data
    },
  })
}
