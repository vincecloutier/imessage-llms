import { useState, DragEvent } from 'react';
import { toast } from 'sonner';

export function useDragAndDrop(handleFileAdded: (file: File) => void) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    
    const handlers = {
      onDragOver: (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
      },
      onDragLeave: (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOver(false);
        }
      },
      onDrop: (e: DragEvent<HTMLDivElement>) => {
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
      }
    };
    
    return { isDraggingOver, handlers };
  }
