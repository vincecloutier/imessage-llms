"use client"

import { useState, useEffect } from "react"
import { X, Image as ImageIcon, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Image from "next/image"
import { createSignedAttachmentUrl } from "@/lib/actions" // Updated import path
import { Skeleton } from "@/components/ui/skeleton"

interface ImagePreviewProps {
  source: string | null | undefined // Can be blob URL, https URL, or file_path
  onDelete?: () => void
  alt?: string
}

export function ImagePreview({ source, onDelete, alt = "Preview image" }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!source) {
      setResolvedUrl(null)
      setIsLoading(false)
      setError(null)
      return
    }

    if (source.startsWith('blob:') || source.startsWith('http')) {
      console.log('ImagePreview: Using direct URL:', source)
      setResolvedUrl(source)
      setIsLoading(false)
      setError(null)
    } else {
      console.log('ImagePreview: Received potential file path, attempting fetch:', source)
      let isMounted = true
      const fetchUrl = async () => {
        setIsLoading(true)
        setError(null)
        try {
          console.log('ImagePreview: Calling createSignedAttachmentUrl with path:', source)
          const result = await createSignedAttachmentUrl(source)
          console.log('ImagePreview: Result from createSignedAttachmentUrl:', result)

          if (!isMounted) return

          if (result.error) {
            console.error("ImagePreview: Failed to get signed URL:", result.error)
            setError(result.error)
            setResolvedUrl(null)
          } else {
            setResolvedUrl(result.signedUrl)
          }
        } catch (err: any) {
          if (!isMounted) return
          console.error("ImagePreview: Error calling createSignedAttachmentUrl action:", err)
          setError(err.message || "Failed to load image.")
          setResolvedUrl(null)
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }
      fetchUrl()

      return () => { isMounted = false }
    }
  }, [source])

  const renderPreviewContent = () => {
    if (isLoading) {
      return <Skeleton className="w-32 h-32" />
    }
    if (error) {
      return (
        <div className="w-32 h-32 flex flex-col items-center justify-center text-destructive bg-destructive/10 border border-destructive/50 rounded-md p-2 text-center">
          <AlertTriangle className="w-6 h-6 mb-1" />
          <span className="text-xs">Load failed</span>
        </div>
      )
    }
    if (resolvedUrl) {
      return (
        <Image
          src={resolvedUrl}
          alt={alt}
          width={128}
          height={128}
          className="w-full h-full object-cover"
          onClick={() => setIsOpen(true)} // Open dialog only if image loaded
        />
      )
    }
    // Fallback if source is null/undefined or resolvedUrl is null without error/loading
    return (
        <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-md">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
    );
  }

  return (
    <>
      <div className="relative inline-block group">
        <div className="border rounded-md overflow-hidden relative w-32 h-32">
          {/* Preview thumbnail */} 
          <div className="w-full h-full cursor-pointer">
             {renderPreviewContent()}
          </div>

          {/* Delete button - Render only if onDelete is provided */} 
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-80 hover:opacity-100 disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation()
                if (onDelete) onDelete()
              }}
              disabled={isLoading} // Disable delete while loading new source
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Image preview dialog - Only allow opening if URL resolved successfully */}
      <Dialog open={isOpen && !!resolvedUrl && !error} onOpenChange={setIsOpen}>
        <DialogOverlay className="bg-black/50" />
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          {resolvedUrl && (
             <Image
               src={resolvedUrl} // Use resolvedUrl here too
               alt={alt}
               width={1024}
               height={768}
               sizes="100vw"
               priority
               className="w-full h-auto max-h-[80vh] object-contain"
             />
          )}
        <VisuallyHidden><DialogTitle>{alt}</DialogTitle></VisuallyHidden>
        </DialogContent>
      </Dialog>
    </>
  )
}
