import { useState, useCallback, RefObject, useEffect } from 'react';
import { toast } from 'sonner';

export function useFileHandler(textareaRef: RefObject<HTMLTextAreaElement>) {
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle the addition of the attachment file
  const handleFileAdded = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return false;
    }
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return false;
    }
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }
    setAttachmentFile(file);
    textareaRef.current?.focus();
    return true;
  }, [setAttachmentFile, textareaRef, previewUrl]);

  // Handle the removal of the attachment file
  const handleFileRemoved = useCallback(() => {
    setAttachmentFile(null);
    textareaRef.current?.focus();
  }, [setAttachmentFile, textareaRef]);

  // Effect to handle the preview URL
  useEffect(() => {
    if (!attachmentFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }
    if (!previewUrl) {
       const objectUrl = URL.createObjectURL(attachmentFile);
       setPreviewUrl(objectUrl);
    }
    return () => {if (previewUrl) {URL.revokeObjectURL(previewUrl);}};
  }, [attachmentFile]);

  return {attachmentFile, setAttachmentFile, previewUrl, handleFileAdded, handleFileRemoved};
} 