import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, ChefHat } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRecipes } from '@/features/recipes/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { resolveRecipeImage } from '@/lib/recipe-images'

interface Creator {
  id: string
  name: string
  avatar: string | null
  recipeCount: number
  totalLikes: number
  topRecipeImage: string | null
  topRecipe: string
  topRecipeId: string
}

export default function CommunityPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  // Fetch a large batch so we can derive all creators
  const { data, isLoading } = useRecipes({ limit: 100 })

  const creators = useMemo<Creator[]>(() => {
    const recipes = data?.data ?? []
    const map = new Map<string, Creator>()

    for (const r of recipes) {
      if (!r.authorId) continue
      const existing = map.get(r.authorId)
      if (existing) {
        existing.recipeCount++
        existing.totalLikes += r.likesCount
        if (r.likesCount > existing.totalLikes - r.likesCount) {
          existing.topRecipe = r.title
          existing.topRecipeImage = r.imageUrl
          existing.topRecipeId = r.id
        }
      } else {
        map.set(r.authorId, {
          id: r.authorId,
          name: r.authorName,
          avatar: r.authorAvatar,
          recipeCount: 1,
          totalLikes: r.likesCount,
          topRecipe: r.title,
          topRecipeImage: r.imageUrl,
          topRecipeId: r.id,
        })
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalLikes - a.totalLikes)
  }, [data])

  const filtered = search.trim()
    ? creators.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : creators

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-primary">Community Creators</h1>
        <p className="mt-2 text-muted-foreground">
          Meet the home cooks and chefs sharing their passion for food
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-10 max-w-md">
        <div className="relative">
          <ChefHat className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators…"
            className="w-full rounded-full border-0 bg-background py-3 pl-11 pr-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-card bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">No creators found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((creator, i) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/recipes?author=${creator.id}`)}
              className="cursor-pointer overflow-hidden rounded-card bg-background shadow-card transition-shadow hover:shadow-card-hover"
            >
              {/* Top recipe cover */}
              <div className="relative h-36 w-full">
                <img
                  src={resolveRecipeImage(creator.topRecipeImage)}
                  alt={creator.topRecipe}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Creator info */}
              <div className="relative px-5 pb-5">
                <div className="-mt-7 mb-3 flex items-end justify-between">
                  <Avatar className="h-14 w-14 ring-2 ring-background">
                    <AvatarImage src={creator.avatar ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {initials(creator.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="secondary" className="mb-1 text-xs">
                    {creator.recipeCount} {creator.recipeCount === 1 ? 'recipe' : 'recipes'}
                  </Badge>
                </div>

                <h3 className="font-display font-semibold text-foreground">{creator.name}</h3>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {creator.totalLikes.toLocaleString()} likes
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
