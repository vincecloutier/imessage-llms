'use client';

import { Attachment, Message } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState, useRef, DragEvent } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { PreviewMessage, ThinkingMessage } from '@/components/custom/message';
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '../ui/button';

import { MultimodalInput } from './multimodal-input';

export function Chat({ id, initialMessages }: { id: string; initialMessages: Array<Message> }) {
  const { messages, handleSubmit, input, setInput, status } = useChat({body: { id }, initialMessages});
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const droppedFiles = event.dataTransfer.files;
    const droppedFilesArray = Array.from(droppedFiles);
    if (droppedFilesArray.length > 0) {
      const validFiles = droppedFilesArray.filter((file) => file.type.startsWith("image/"));
      if (validFiles.length === droppedFilesArray.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        toast.error("Only image files are allowed!");
      }
    }
    setIsDragging(false);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (items) {
      const files = Array.from(items)
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length > 0) {
        const validFiles = files.filter((file) => file.type.startsWith("image/"));
        if (validFiles.length === files.length) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach((file) => dataTransfer.items.add(file));
          setFiles(dataTransfer.files);
        } else {
          toast.error("Only image files are allowed");
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
        setFiles(dataTransfer.files);
      } else {
        toast.error("Only image files are allowed");
      }
    }
  };

  return (
    <>
      <div className="relative h-dvh" ref={containerRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
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
              className="w-full md:max-w-3xl mx-auto px-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (files && files.length > 0) {
                  const options = { experimental_attachments: files };
                  handleSubmit(e, options);
                  setFiles(null);
                } else {
                  handleSubmit(e);
                }
              }}
            >
              <AnimatePresence>
                {files && files.length > 0 && (
                  <motion.div
                    className="flex flex-row gap-2 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {Array.from(files).map((file) =>
                      file.type.startsWith("image") ? (
                        <div key={file.name}>
                          <motion.img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="rounded-md w-16 h-16 object-cover border border-zinc-200 dark:border-zinc-700"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ y: -10, scale: 1.1, opacity: 0, transition: { duration: 0.2 } }}
                          />
                        </div>
                      ) : null
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <MultimodalInput
                personaId={id}
                input={input}
                setInput={setInput}
                handleSubmit={(e) => {
                  const options = files ? { experimental_attachments: files } : {};
                  handleSubmit(e, options);
                  setFiles(null);
                }}
                isLoading={status === 'submitted'}
                attachments={attachments}
                setAttachments={setAttachments}
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