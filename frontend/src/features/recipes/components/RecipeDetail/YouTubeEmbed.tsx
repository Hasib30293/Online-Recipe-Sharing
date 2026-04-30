interface YouTubeEmbedProps {
  youtubeId: string
}

function extractYouTubeId(input: string): string {
  const trimmed = input.trim()
  // Already a bare 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  // youtube.com/watch?v=ID, youtube.com/embed/ID, youtu.be/ID
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  return match ? match[1] : trimmed
}

export function YouTubeEmbed({ youtubeId }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(youtubeId)

  return (
    <div className="overflow-hidden rounded-xl">
      <div className="relative aspect-video">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Recipe video tutorial"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  )
}
