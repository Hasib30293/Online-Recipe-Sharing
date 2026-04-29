import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RecipeFormValues } from '../schemas'

function extractYouTubeId(input: string): string {
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  return match ? match[1] : trimmed
}

export function VideoTutorialInput() {
  const { register, setValue, formState: { errors } } = useFormContext<RecipeFormValues>()

  return (
    <div className="space-y-1.5">
      <Label htmlFor="youtubeId">YouTube Video (optional)</Label>
      <Input
        id="youtubeId"
        placeholder="e.g. dQw4w9WgXcQ or full YouTube URL"
        {...register('youtubeId', {
          onChange: (e) => {
            const extracted = extractYouTubeId(e.target.value)
            setValue('youtubeId', extracted, { shouldValidate: true })
          },
        })}
      />
      {errors.youtubeId && (
        <p className="text-xs text-destructive">{errors.youtubeId.message}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Paste the video ID or the full YouTube URL — we'll extract the ID automatically.
      </p>
    </div>
  )
}
