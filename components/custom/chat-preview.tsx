"use client"

import { useState, useEffect } from "react"
import { X, Image as ImageIcon, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { createSignedAttachmentUrl } from "@/lib/actions"
import { Skeleton } from "@/components/ui/skeleton"

interface ImagePreviewProps {
  source: string | null | undefined | File
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

    // Handle File object directly
    if (source instanceof File) {
      const objectUrl = URL.createObjectURL(source)
      setResolvedUrl(objectUrl)
      setIsLoading(false)
      setError(null)
      
      // Clean up function
      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    }

    // Handle string URLs (blob or http)
    if (typeof source === 'string') {
      if (source.startsWith('blob:') || source.startsWith('http')) {
        setResolvedUrl(source)
        setIsLoading(false)
        setError(null)
      } else {
        let isMounted = true
        const fetchUrl = async () => {
          setIsLoading(true)
          setError(null)
          try {
            const result = await createSignedAttachmentUrl(source)
            if (!isMounted) return
            if (result.error) {
              setError(result.error)
              setResolvedUrl(null)
            } else {
              setResolvedUrl(result.signedUrl)
            }
          } catch (err: any) {
            if (!isMounted) return
            setError(err.message || "Failed to load image.")
            setResolvedUrl(null)
          } finally {
            if (isMounted) setIsLoading(false)
          }
        }
        fetchUrl()
        return () => { isMounted = false }
      }
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
          onClick={() => setIsOpen(true)}
        />
      )
    }
    return (
        <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-md">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
    );
  }

  return (
    <>
      <div className="relative inline-block group">
        <div className="border rounded-2xl overflow-hidden relative w-32 h-32">
          <div className="w-full h-full cursor-pointer">
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
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Custom Fullscreen Preview Modal */}
      {isOpen && resolvedUrl && !error && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsOpen(false)} // Close on overlay click
        >
          {/* Image container: stop propagation so clicking image doesn't close */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={resolvedUrl}
              alt={alt}
              width={1024} // Example large dimensions
              height={768}
              sizes="100vw" // Let browser choose based on viewport
              priority // Load large image faster when opened
              className="block max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-md min-h-[500px]" // Ensure image fits screen
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}