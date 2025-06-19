import { useState, useEffect } from 'react'
import { createSignedAttachmentUrl } from '@/lib/actions'

export function useResolvedImageUrl(source: string | File | null | undefined): {
  resolvedUrl: string | null
  isLoading: boolean
  error: string | null
} {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // flag to track if the component is still mounted to prevent state updates after unmount
    let isMounted = true
    // store the object URL if created, so it can be revoked on cleanup.
    let objectUrlToRevoke: string | null = null

    const resolveSource = async () => {
      // reset state when source changes or becomes null/undefined
      if (!source) {
        setResolvedUrl(null)
        setIsLoading(false)
        setError(null)
        return
      }

      // start loading process
      setIsLoading(true)
      setError(null)
      setResolvedUrl(null) // clear previous URL immediately

      // handle file objects (uploads)
      if (source instanceof File) {
        objectUrlToRevoke = URL.createObjectURL(source)
        if (isMounted) {
          setResolvedUrl(objectUrlToRevoke)
        }
      }
      // handle string sources that start with blob: or http: by using them directly
      else if (
        typeof source === 'string' &&
        (source.startsWith('blob:') || source.startsWith('http'))
      ) {
        if (isMounted) {
          setResolvedUrl(source)
        }
      }
      // otherwise, assume it's a relative path needing a signed URL
      else {
        const result = await createSignedAttachmentUrl(source)
        if (!isMounted) return // don't update state if unmounted
        setError(result.error)
        setResolvedUrl(result.signedUrl)
      }
      // always stop loading indicator if still mounted
      if (isMounted) {
        setIsLoading(false)
        setError(null)
      }
    }

    // actually resolve the source
    resolveSource()

    // cleanup function runs when the component unmounts or the source changes to prevent memory leaks
    return () => {
      isMounted = false
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke)
      }
    }
  }, [source]) // re-run the effect if the source changes
  // return the state variables for the consuming component
  return { resolvedUrl, isLoading, error }
}
