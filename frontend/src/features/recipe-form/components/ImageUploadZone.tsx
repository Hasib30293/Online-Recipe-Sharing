import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'

interface ImageUploadZoneProps {
  value?: string
  onChange: (url: string) => void
}

export function ImageUploadZone({ value, onChange }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await api.post<{ success: boolean; data: { url: string } }>(
        '/upload/image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      if (res.data.data?.url) onChange(res.data.data.url)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Upload failed. Please try again.'
      setError(msg)
    } finally {
      setUploading(false)
      // Reset input so the same file can be re-selected after removal
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        className="relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 transition-colors hover:border-primary/50"
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file && !uploading) handleFile(file)
        }}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="max-h-48 rounded-lg object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={(e) => { e.stopPropagation(); onChange('') }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : uploading ? (
          <>
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click or drag &amp; drop to upload</p>
            <p className="text-xs text-muted-foreground">JPEG, PNG, WebP · max 10 MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
