import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecipeCard } from '@/components/shared/RecipeCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useFavoriteRecipes, useToggleFavorite } from '@/features/favorites/api'
import { useFavorites } from '@/features/favorites/api'

export default function SavedRecipesPage() {
  const navigate = useNavigate()
  const { data: recipes, isLoading } = useFavoriteRecipes()
  const { data: favoriteIds } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-3">
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="font-display text-3xl font-bold">Saved Recipes</h1>
        {recipes?.length ? (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm text-muted-foreground">
            {recipes.length}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : !recipes?.length ? (
        <div className="py-20 text-center">
          <p className="mb-4 text-muted-foreground">You haven't saved any recipes yet.</p>
          <Button onClick={() => navigate('/recipes')}>Browse Recipes</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorited={favoriteIds?.includes(recipe.id) ?? true}
              onToggleFavorite={(id, cur) => toggleFavorite({ recipeId: id, isFavorited: cur })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
