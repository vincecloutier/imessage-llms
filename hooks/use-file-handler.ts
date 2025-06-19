import { useState, useCallback, RefObject } from 'react'
import { toast } from 'sonner'

export function useFileHandler(textareaRef: RefObject<HTMLTextAreaElement>) {
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const handleFileAdded = useCallback(
    (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Failed to upload file.', {
          description: 'Only files smaller than 5MB can be uploaded.',
        })
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Failed to upload file.', { description: 'Only image files can be uploaded.' })
        return false
      }

      setAttachmentFile(file)
      textareaRef.current?.focus()
      return true
    },
    [setAttachmentFile, textareaRef]
  )

  const handleFileRemoved = useCallback(() => {
    setAttachmentFile(null)
    textareaRef.current?.focus()
  }, [setAttachmentFile, textareaRef])

  return { attachmentFile, setAttachmentFile, handleFileAdded, handleFileRemoved }
}
