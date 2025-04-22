// hooks/use-file-handler.ts
import { useState, useRef, useCallback, DragEvent } from 'react';
import { Attachment } from 'ai';
import { toast } from "sonner";

// Helper function to convert File to Attachment with data URL (remains the same)
const fileToAttachment = async (file: File): Promise<Attachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve({
        name: file.name,
        contentType: file.type,
        url: event.target?.result as string,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useFileHandler = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [previewAttachments, setPreviewAttachments] = useState<Array<Attachment>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFilesAndPreviews = useCallback(async (newFiles: FileList | null) => {
    setFiles(newFiles);
    if (newFiles && newFiles.length > 0) {
      try {
        const attachmentPromises = Array.from(newFiles).map(fileToAttachment);
        const resolvedAttachments = await Promise.all(attachmentPromises);
        setPreviewAttachments(resolvedAttachments);
      } catch (error) {
        console.error("Error creating file previews:", error);
        toast.error("Error creating file previews.");
        setPreviewAttachments([]);
        setFiles(null); // Clear files if preview fails
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
      }
    } else {
      setPreviewAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input when clearing
      }
    }
  }, []); // Empty dependency array as it relies on setters and refs

  const processFiles = useCallback((filesArray: File[]): boolean => {
    if (filesArray.length === 0) {
      updateFilesAndPreviews(null);
      return true; // No files to process is not an error state
    }
    const validFiles = filesArray.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === filesArray.length) {
      const dataTransfer = new DataTransfer();
      validFiles.forEach((file) => dataTransfer.items.add(file));
      updateFilesAndPreviews(dataTransfer.files);
      return true;
    } else {
      toast.error("Only image files are allowed!");
      updateFilesAndPreviews(null); // Clear files and previews on error
      return false;
    }
  }, [updateFilesAndPreviews]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(event.dataTransfer.files));
  }, [processFiles]);

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (items) {
      const filesFromPaste = Array.from(items)
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);
      processFiles(filesFromPaste);
    }
  }, [processFiles]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      processFiles(Array.from(selectedFiles));
      // Don't clear the input value here if processFiles fails,
      // as updateFilesAndPreviews will handle it.
    } else {
      updateFilesAndPreviews(null); // Clear if selection is cancelled
    }
  }, [processFiles, updateFilesAndPreviews]);

  const clearFiles = useCallback(() => {
    updateFilesAndPreviews(null);
  }, [updateFilesAndPreviews]);

  return {
    files,
    previewAttachments,
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
    handleFileChange,
    clearFiles,
  };
};
