import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Clock, Star, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/features/recipes/types'

interface RecipeCardProps {
  recipe: Recipe
  isFavorited?: boolean
  onToggleFavorite?: (id: string, current: boolean) => void
  className?: string
}

export function RecipeCard({ recipe, isFavorited, onToggleFavorite, className }: RecipeCardProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      whileHover={reduce ? {} : { y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn('group', className)}
    >
      <Card className="overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md">
        <Link to={`/recipes/${recipe.id}`}>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
            )}

            {recipe.category && (
              <Badge className="absolute left-2 top-2 bg-primary/90 text-primary-foreground">
                {recipe.category}
              </Badge>
            )}

            {onToggleFavorite && (
              <button
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur transition-colors hover:bg-background"
                onClick={(e) => {
                  e.preventDefault()
                  onToggleFavorite(recipe.id, isFavorited ?? false)
                }}
              >
                <Heart
                  className={cn('h-4 w-4', isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
                />
              </button>
            )}
          </div>
        </Link>

        <CardContent className="p-3">
          <Link to={`/recipes/${recipe.id}`}>
            <h3 className="line-clamp-2 font-medium leading-snug hover:text-primary">{recipe.title}</h3>
          </Link>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {recipe.prepTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.prepTime}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {Number(recipe.rating).toFixed(1)}
            </span>
            <Badge variant="outline" className="py-0 text-xs">
              {recipe.difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
