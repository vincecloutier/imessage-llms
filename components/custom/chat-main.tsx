'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, DragEvent, ClipboardEvent, useCallback } from 'react';
import { InputMessage, PreviewMessage, ThinkingMessage } from '@/components/custom/chat-message';
import { SidebarTrigger } from '../ui/sidebar';
import AuthButton from './logout-button';
import { BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage, Breadcrumb, } from '../ui/breadcrumb';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import cx from 'classnames';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  file_path?: string | null;
};

export function Chat({ user_id, id, initialMessages }: { user_id: string | null; id: string | null; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(
      initialMessages?.map(msg => ({ ...msg, file_path: msg.file_path })) || []
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
  }, [setAttachmentFile]);

  const sendMessage = async () => {
    const messageContent = input.trim();
    const currentAttachmentFile = attachmentFile;

    if (!id || (!messageContent && !currentAttachmentFile)) {
      toast.error('Please enter a message or add an attachment.');
      return;
    }
    setIsLoading(true);

    const userMessage: Message = { role: 'user', content: messageContent };
    let tempAttachmentUrl: string | null = null;

    if (currentAttachmentFile) {
      tempAttachmentUrl = URL.createObjectURL(currentAttachmentFile);
      userMessage.file_path = tempAttachmentUrl;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachmentFile(null);

    const formData = new FormData();
    formData.append('user_id', user_id || '');
    formData.append('persona_id', id);
    formData.append('message', messageContent);
    if (currentAttachmentFile) {
      formData.append('attachment', currentAttachmentFile);
    }

    let responseReceived = false;

    try {
      if (tempAttachmentUrl) {
        URL.revokeObjectURL(tempAttachmentUrl);
      }

      const response = await fetch('http://localhost:3001/api/frontend', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      responseReceived = true;

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: result.message.content };
      if (result.message.attachment) {
        assistantMessage.file_path = result.message.attachment;
      }
       setMessages((prev) => {
         const updatedMessages = prev.map(msg =>
           msg === userMessage
             ? { ...msg, file_path: msg.file_path || null }
             : msg
         );
         return [...updatedMessages, assistantMessage];
       });
       
    } catch (err: any) {
       if (tempAttachmentUrl && !responseReceived) {
           URL.revokeObjectURL(tempAttachmentUrl);
       }
       console.error("Send message error:", err);
       toast.error(`Failed to send message: ${err.message}`);
       setMessages((prev) => [...prev.filter(msg => msg !== userMessage), {role: 'assistant', content: `Error: ${err.message || 'Could not send message'}`}]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    if (isLoading) {
        toast.error('Please wait for the previous response to complete.');
        return;
    }
    sendMessage();
  };

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        setIsDraggingOver(false);
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const imageFile = Array.from(event.dataTransfer.files).find(file => file.type.startsWith('image/'));
      const fileToUse = imageFile || event.dataTransfer.files[0];

      if(fileToUse.type.startsWith('image/')) {
         handleFileAdded(fileToUse);
      } else {
          toast.info("Only image files can be dropped as attachments.");
      }
      event.dataTransfer.clearData();
    }
  }, [handleFileAdded]);

  const handlePaste = useCallback((event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const isPastingInTextarea = event.target === textareaRef.current;

    let imageHandled = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          handleFileAdded(file);
          imageHandled = true;
          break;
        }
      }
    }

    if (imageHandled) return;

    if (!isPastingInTextarea) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
             if (item.kind === 'string' && item.type === 'text/plain') {
                item.getAsString((text) => {
                    setInput((prev) => prev + text);
                    textareaRef.current?.focus();
                    requestAnimationFrame(() => {
                        if (textareaRef.current) {
                            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
                        }
                    });
                });
                 break;
            }
        }
    }

  }, [handleFileAdded, setInput]);

  const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (event.key === 'Escape' && attachmentFile) {
         if (!isInputFocused) {
             event.preventDefault();
             setAttachmentFile(null);
             toast.info("Attachment removed.");
         }
         else if (target === textareaRef.current) {
              setAttachmentFile(null);
              toast.info("Attachment removed.");
         }
      }

      if (!isInputFocused && target.tagName !== 'BUTTON' && event.key.length === 1 && !event.isComposing) {
           textareaRef.current?.focus();
      }

  }, [attachmentFile, setAttachmentFile]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className={cx(
          "relative h-dvh transition-colors duration-200 ease-in-out flex flex-col",
          { 'bg-blue-100 dark:bg-blue-900/30': isDraggingOver }
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <header className="flex justify-between h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">Persona</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>April</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <AuthButton />
      </header>

      <div className="flex-1 flex flex-col min-w-0 gap-6 pt-4 overflow-y-scroll scrollbar-hide px-4 relative">
          {isDraggingOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none z-10 rounded-md m-2 border border-dashed border-blue-400">
                  <p className="text-white text-2xl font-semibold">Drop image to attach</p>
              </div>
           )}
        {messages.map((message, index) => (<PreviewMessage key={index} message={message}/>))}
        {isLoading && <ThinkingMessage />}
        <div ref={messagesEndRef}/>
        <div className="pb-4">
          <InputMessage
            textareaRef={textareaRef}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            attachmentFile={attachmentFile}
            setAttachmentFile={setAttachmentFile}
          />
       </div>
      </div>
    </div>
  );
}