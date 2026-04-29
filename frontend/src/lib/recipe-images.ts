const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'

export function resolveRecipeImage(url: string | null | undefined): string {
  if (!url || url.trim() === '') return FALLBACK_IMAGE
  return url
}
