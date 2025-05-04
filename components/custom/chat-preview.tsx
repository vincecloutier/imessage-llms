"use client"
// TODO: clean up this file
import { useState, useEffect } from "react"
import { X, Image as ImageIcon, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { createSignedAttachmentUrl } from "@/lib/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { useResolvedImageUrl } from "@/hooks/use-chat-resolved-image"


export function ImagePreview({ source, onDelete, alt = "Preview image" }: {source: string | null | undefined | File, onDelete?: () => void, alt?: string}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { resolvedUrl, isLoading, error } = useResolvedImageUrl(source)

  const handlePreviewClick = () => {
    if (resolvedUrl && !error && !isLoading) {
       setIsModalOpen(true);
    }
  };

  const renderPreviewContent = () => {
    if (isLoading) {return <Skeleton className="w-full h-full" />}
    if (resolvedUrl) {
      return (
        <Image
          src={resolvedUrl}
          alt={alt}
          fill
          sizes="(max-width: 128px) 100vw, 128px"
          className="object-cover"
          onClick={handlePreviewClick}
        />
      )
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted"><ImageIcon className="w-8 h-8 text-muted-foreground" /></div>
    );
  }

  return (
    <>
      <div className="relative inline-block group w-32 h-32">
        <div className="border rounded-2xl overflow-hidden relative w-full h-full">
          <div className={`w-full h-full ${resolvedUrl && !error && !isLoading ? 'cursor-pointer' : ''}`}>
             {renderPreviewContent()}
          </div>
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-80 hover:opacity-100 disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation()
                if (onDelete) onDelete()
              }}
              disabled={isLoading}
              aria-label="Delete image"
            >
              <X className="h-3 w-3" />
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
              priority
              className="block max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-md min-h-[500px]"
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