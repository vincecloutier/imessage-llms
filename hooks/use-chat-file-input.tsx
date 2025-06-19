import { useCallback, useState, RefObject, ClipboardEvent, DragEvent, useEffect } from 'react'
import { toast } from 'sonner'

export function useFileInput(
  textareaRef: RefObject<HTMLTextAreaElement>,
  setInput: (value: ((prev: string) => string) | string) => void,
  handleFileAdded: (file: File) => boolean,
  attachmentFile: File | null
) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement> | ClipboardEvent) => {
      if (!!document.querySelector('[role="dialog"][data-state="open"]')) {
        return
      } // to prevent pasting in the textarea when a dialog is open
      const items = event.clipboardData?.items
      if (!items) return

      const imageItem = Array.from(items).find(
        (item) => item.kind === 'file' && item.type.startsWith('image/')
      )
      if (imageItem) {
        const file = imageItem.getAsFile()
        if (file) {
          event.preventDefault()
          handleFileAdded(file)
          return
        }
      }

      const textItem = Array.from(items).find(
        (item) => item.kind === 'string' && item.type === 'text/plain'
      )
      if (textItem) {
        if (event.target === textareaRef.current) {
          return
        } // to prevent double pasting in the textarea
        event.preventDefault()
        textItem.getAsString((text) => {
          setInput((prev) => prev + text)
          textareaRef.current?.focus()
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
                textareaRef.current.value.length
            }
          })
        })
      }
    },
    [handleFileAdded, setInput, textareaRef]
  )

  useEffect(() => {
    document.addEventListener('paste', handlePaste as unknown as EventListener)
    return () => {
      document.removeEventListener('paste', handlePaste as unknown as EventListener)
    }
  }, [handlePaste])

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }, [])

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false)
    }
  }, [])

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)
      if (e.dataTransfer.files?.length > 0) {
        const imageFile = Array.from(e.dataTransfer.files).find((file) =>
          file.type.startsWith('image/')
        )
        if (imageFile) {
          handleFileAdded(imageFile)
        } else {
          toast.info('Failed to upload file.', { description: 'Only image files can be uploaded.' })
        }
        e.dataTransfer.clearData()
      }
    },
    [handleFileAdded]
  )

  return {
    isDraggingOver,
    attachmentFile,
    handlers: { onPaste: handlePaste, onDragOver, onDragLeave, onDrop },
  }
}
