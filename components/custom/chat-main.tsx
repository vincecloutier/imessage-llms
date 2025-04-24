'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, DragEvent, ClipboardEvent, useCallback } from 'react';
import { PreviewMessage, ThinkingMessage } from '@/components/custom/chat-message';
import { toast } from 'sonner';
import cx from 'classnames';
import { AppHeader } from '@/components/custom/app-header';
import { AnimatePresence, motion } from 'framer-motion';
import { InputMessage } from '@/components/custom/chat-message';
import { useDragAndDrop } from '@/hooks/use-chat-drag-and-drop';
import { usePaste } from '@/hooks/use-chat-paste';
import { useKeyboardFocus } from '@/hooks/use-chat-keyboard-focus';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  file_path?: string | null;
};

export function Chat({ user_id, id, initialMessages, persona_name }: { user_id: string | null; id: string | null; initialMessages: Message[]; persona_name: string | null}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages?.map(msg => ({ ...msg, file_path: msg.file_path })) || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
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
      
      setMessages((prev) => {
         const updatedMessages = prev.map(msg =>
           msg === userMessage
             ? { ...msg, file_path: msg.file_path  }
             : msg
         );
         return [...updatedMessages, assistantMessage];
       });
       
       if (tempAttachmentUrl) {
         URL.revokeObjectURL(tempAttachmentUrl);
       }
       
    } catch (err: any) {
       if (tempAttachmentUrl && !responseReceived) {URL.revokeObjectURL(tempAttachmentUrl);}
       console.error("Send message error:", err);
       toast.error(`Failed to send message: ${err.message}`);
       setMessages((prev) => [
         ...prev.filter(msg => msg !== userMessage),
         { role: 'assistant', content: `Error: ${err.message || 'Could not send message'}` }
       ]);
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

  useKeyboardFocus(textareaRef);
  const handlePaste = usePaste(textareaRef, setInput, handleFileAdded);
  const { isDraggingOver, handlers } = useDragAndDrop(handleFileAdded);
  return (
    <div className={cx("relative h-dvh transition-colors duration-200 ease-in-out flex flex-col")} onPaste={handlePaste} {...handlers}>
      <AppHeader title="Chat" subtitle={persona_name || ''} />
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div  className="absolute top-16 inset-4 pointer-events-none z-10 flex flex-col items-center justify-center gap-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-sm dark:text-zinc-400 text-zinc-500"> {"Images Only"}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0 gap-6 pt-4 overflow-y-scroll scrollbar-hide px-4 relative">
        {messages.map((message, index) => (<PreviewMessage key={index} message={message}/>))}
        {isLoading && <ThinkingMessage />}
        <div ref={messagesEndRef}/>
      </div>
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
  );
}