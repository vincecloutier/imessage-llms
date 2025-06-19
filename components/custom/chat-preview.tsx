'use client'

import Image from 'next/image'
import { useState } from 'react'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useResolvedImageUrl } from '@/hooks/use-chat-resolved-image'

export function ImagePreview({
  source,
  onDelete,
  alt = 'Preview image',
}: {
  source: string | null | undefined | File
  onDelete?: () => void
  alt?: string
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { resolvedUrl, isLoading, error } = useResolvedImageUrl(source)

  const handlePreviewClick = () => {
    if (resolvedUrl && !error && !isLoading) setIsModalOpen(true)
  }
  const renderPreviewContent = () => {
    if (resolvedUrl)
      return (
        <Image
          src={resolvedUrl}
          alt={alt}
          fill
          sizes="(max-width: 128px) 100vw, 128px"
          priority
          className="object-cover"
          onClick={handlePreviewClick}
        />
      )
    return <div className="w-full h-full animate-pulse rounded-lg bg-muted" />
  }

  return (
    <>
      <div className="relative inline-block group size-32">
        <div className="border rounded-lg overflow-hidden relative size-full">
          <div
            className={`size-full ${resolvedUrl && !error && !isLoading ? 'cursor-pointer' : ''}`}
          >
            {renderPreviewContent()}
          </div>
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              disabled={isLoading}
              aria-label="Delete image"
              className="absolute top-1 right-1 size-6 rounded-full opacity-80 hover:opacity-100 disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation()
                if (onDelete) onDelete()
              }}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>
      {isModalOpen && resolvedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={resolvedUrl}
              alt={alt}
              width={1024}
              height={768}
              sizes="100vw"
              className="block max-w-full max-h-[90vh] size-auto object-contain rounded-md min-h-[500px]"
              onClick={(e) => {
                e.stopPropagation()
                setIsModalOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
