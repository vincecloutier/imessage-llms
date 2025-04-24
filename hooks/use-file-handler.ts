import { useState, useCallback, RefObject } from 'react';
import { toast } from 'sonner';

export function useFileHandler(textareaRef: RefObject<HTMLTextAreaElement>) {
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const handleFileAdded = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }
    setAttachmentFile(file);
    textareaRef.current?.focus();
  }, [setAttachmentFile, textareaRef]);

  return {
    attachmentFile,
    setAttachmentFile,
    handleFileAdded
  };
} 