'use client';

import { Attachment, Message } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState, useRef, DragEvent } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { InputMessage, PreviewMessage, ThinkingMessage } from '@/components/custom/message';
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '../ui/button';

// Helper function to convert File to Attachment with data URL
const fileToAttachment = async (file: File): Promise<Attachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve({
        name: file.name,
        contentType: file.type,
        url: event.target?.result as string, // Use data URL for preview
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function Chat({ id, initialMessages }: { id: string; initialMessages: Array<Message> }) {
  const { messages, handleSubmit, input, setInput, status } = useChat({body: { id }, initialMessages});
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [files, setFiles] = useState<FileList | null>(null);
  const [previewAttachments, setPreviewAttachments] = useState<Array<Attachment>>([]); // New state for previews
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to update both files and previewAttachments state
  const updateFilesAndPreviews = async (newFiles: FileList | null) => {
    setFiles(newFiles);
    if (newFiles && newFiles.length > 0) {
      const attachmentPromises = Array.from(newFiles).map(fileToAttachment);
      const resolvedAttachments = await Promise.all(attachmentPromises);
      setPreviewAttachments(resolvedAttachments);
    } else {
      setPreviewAttachments([]); // Clear previews if files are cleared
    }
  };

  // File handling functions
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false); // Moved inside to handle state update correctly
    const droppedFiles = event.dataTransfer.files;
    const droppedFilesArray = Array.from(droppedFiles);
    if (droppedFilesArray.length > 0) {
      const validFiles = droppedFilesArray.filter((file) => file.type.startsWith("image/"));
      if (validFiles.length === droppedFilesArray.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        updateFilesAndPreviews(dataTransfer.files); // Use helper
      } else {
        toast.error("Only image files are allowed!");
        updateFilesAndPreviews(null); // Clear invalid files
      }
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (items) {
      const filesFromPaste = Array.from(items)
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (filesFromPaste.length > 0) {
        const validFiles = filesFromPaste.filter((file) => file.type.startsWith("image/"));
        if (validFiles.length === filesFromPaste.length) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach((file) => dataTransfer.items.add(file));
          updateFilesAndPreviews(dataTransfer.files); // Use helper
        } else {
          toast.error("Only image files are allowed");
          updateFilesAndPreviews(null); // Clear invalid files
        }
      }
    }
  };

  // Function to handle files selected from the file dialog
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter(
        (file) => file.type.startsWith("image/")
      );

      if (validFiles.length === selectedFiles.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        updateFilesAndPreviews(dataTransfer.files); // Use helper
      } else {
        toast.error("Only image files are allowed");
        updateFilesAndPreviews(null); // Clear invalid files
        // Also clear the file input value
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
       updateFilesAndPreviews(null); // Clear if selection is cancelled
    }
  };

  return (
    <>
      <div className="relative h-dvh" ref={containerRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onPaste={handlePaste}>
        <AnimatePresence>
          {isDragging && (
            <motion.div
              className="absolute inset-0 pointer-events-none dark:bg-zinc-900/90 z-10 flex flex-col gap-1 justify-center items-center bg-zinc-100/90 rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>Drag and drop files here</div>
              <div className="text-sm dark:text-zinc-400 text-zinc-500">
                {"(images only)"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex justify-between h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    Persona
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>April</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-4">
            <Button variant="outline">Login</Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col min-w-0 h-[calc(100%-4rem)] gap-4 px-4 pt-0">
          <div
            ref={messagesContainerRef}
            className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 scrollbar-hide"
          >
            {messages.map((message, index) => (
              <PreviewMessage
                key={message.id}
                message={message}
                isLoading={status === 'submitted' && messages.length - 1 === index}
              />
            ))}

            {status === 'submitted' &&
              messages.length > 0 &&
              messages[messages.length - 1].role === 'user' && (
                <ThinkingMessage />
              )}

            <form
              className="w-full mx-auto px-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (files && files.length > 0) {
                  const options = { experimental_attachments: files };
                  handleSubmit(e, options);
                  updateFilesAndPreviews(null); // Clear files and previews on submit
                } else {
                  handleSubmit(e);
                }
              }}
            >
              <InputMessage
                personaId={id}
                input={input}
                setInput={setInput}
                handleSubmit={(e) => {
                  const options = files ? { experimental_attachments: files } : {};
                  handleSubmit(e, options);
                  updateFilesAndPreviews(null); // Clear files and previews on submit via Enter key
                }}
                isLoading={status === 'submitted'}
                attachments={previewAttachments}
              />
            </form>

            <div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[24px]"
            />
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </>
  );
}