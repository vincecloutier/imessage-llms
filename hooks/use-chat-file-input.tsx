import { useCallback, useState, RefObject, ClipboardEvent, DragEvent } from 'react';
import { toast } from 'sonner';

export function useFileInput(textareaRef: RefObject<HTMLTextAreaElement>, setInput: (value: ((prev: string) => string) | string) => void) {  
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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
  }, [textareaRef]);
  
  const onPaste = useCallback((event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    
    const imageItem = Array.from(items).find(
      item => item.kind === 'file' && item.type.startsWith('image/')
    );
    
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        event.preventDefault();
        handleFileAdded(file);
        return;
      }
    }
    
    if (event.target !== textareaRef.current) {
      const textItem = Array.from(items).find(
        item => item.kind === 'string' && item.type === 'text/plain'
      );
      
      if (textItem) {
        textItem.getAsString((text) => {
          setInput(prev => prev + text);
          textareaRef.current?.focus();
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
            }
          });
        });
      }
    }
  }, [handleFileAdded, setInput, textareaRef]);

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);
  
  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  }, []);
  
  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files?.length > 0) {
      const imageFile = Array.from(e.dataTransfer.files).find(file => file.type.startsWith('image/'));
      if (imageFile) {
        handleFileAdded(imageFile);
      } else {
        toast.info("Only image files can be dropped as attachments.");
      }
      e.dataTransfer.clearData();
    }
  }, [handleFileAdded]);
  
  return { 
    isDraggingOver,
    attachmentFile,
    setAttachmentFile,
    handlers: {onPaste, onDragOver, onDragLeave, onDrop}
  };
}