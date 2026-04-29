import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Star, Users, ChefHat, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { IngredientsList } from '@/features/recipes/components/RecipeDetail/IngredientsList'
import { StepsList } from '@/features/recipes/components/RecipeDetail/StepsList'
import { NutritionTable } from '@/features/recipes/components/RecipeDetail/NutritionTable'
import { YouTubeEmbed } from '@/features/recipes/components/RecipeDetail/YouTubeEmbed'
import { CommentList } from '@/features/comments/components/CommentList'
import { CommentForm } from '@/features/comments/components/CommentForm'
import { useRecipe } from '@/features/recipes/api'
import { useFavorites, useToggleFavorite } from '@/features/favorites/api'
import { useAuth } from '@/providers/AuthProvider'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: recipe, isLoading } = useRecipe(id!)
  const { data: favoriteIds } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()

  const isFavorited = favoriteIds?.includes(id!) ?? false

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="mb-4 h-8 w-2/3" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!recipe) return <div className="container py-16 text-center">Recipe not found.</div>

  return (
    <div className="container py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 mt-4 flex items-center gap-1.5 text-sm text-black dark:text-white hover:text-primary dark:hover:text-primary transition-colors font-bold"
      >
        <ArrowLeft className="h-4 w-4" />
        
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          {recipe.category && <Badge className="mb-2">{recipe.category}</Badge>}
          <h1 className="font-display text-3xl font-bold lg:text-4xl">{recipe.title}</h1>
        </div>
        {user && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => toggleFavorite({ recipeId: recipe.id, isFavorited })}
          >
            <Heart className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
          </Button>
        )}
      </div>

      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="mb-6 aspect-video w-full rounded-xl object-cover"
        />
      )}

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {recipe.prepTime && (
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{recipe.prepTime}</span>
        )}
        <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{Number(recipe.rating).toFixed(1)} ({recipe.reviewsCount})</span>
        <span className="flex items-center gap-1"><Users className="h-4 w-4" />{recipe.servings} servings</span>
        <Badge variant="outline">{recipe.difficulty}</Badge>
        {recipe.authorName && (
          <span className="flex items-center gap-1">
            <ChefHat className="h-4 w-4" />
            <Link to={recipe.authorId ? `/community?author=${recipe.authorId}` : '#'} className="hover:text-primary">
              {recipe.authorName}
            </Link>
          </span>
        )}
      </div>

      {recipe.description && (
        <p className="mb-6 text-muted-foreground">{recipe.description}</p>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        <div className="order-2 md:order-1 md:col-span-2 space-y-8">
          <StepsList instructions={recipe.instructions} />
          {recipe.youtubeId && <YouTubeEmbed youtubeId={recipe.youtubeId} />}
          <Separator />
          <div>
            <h3 className="mb-4 font-display text-lg font-semibold">Comments</h3>
            <CommentForm recipeId={recipe.id} />
            <div className="mt-6">
              <CommentList recipeId={recipe.id} />
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2 space-y-4">
          <IngredientsList ingredients={recipe.ingredients} servings={recipe.servings} />
          <NutritionTable nutrition={recipe.nutrition} />
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((t) => (
                <Badge key={t.id} variant="secondary">{t.tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
