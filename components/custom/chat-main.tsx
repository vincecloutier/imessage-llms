'use client';

import {useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { PreviewMessage, ThinkingMessage } from '@/components/custom/chat-message';
import { toast } from 'sonner';
import { AppHeader } from '@/components/custom/app-header';
import { AnimatePresence, motion } from 'framer-motion';
import { InputMessage } from '@/components/custom/chat-message';
import { useKeyboardFocus } from '@/hooks/use-chat-keyboard-focus';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useFileInput } from '@/hooks/use-chat-file-input';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  file_path?: string | null;
};

export function Chat({ user_id, persona_id, persona_name, initialMessages }: { user_id: string | null; persona_id: string | null; persona_name: string | null; initialMessages: Message[];}) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Custom hooks for handling messages, file attachments and API calls
  const { messages,isLoading, input, setInput, sendMessage } = useChatMessages({ initialMessages, user_id, persona_id });
  const { isDraggingOver, handlers, attachmentFile, setAttachmentFile } = useFileInput(textareaRef, setInput);  
  useKeyboardFocus(textareaRef);

  // Auto-scroll to bottom when messages change
  useEffect(() => {messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [messages]);

  // Handle form submission
  const handleSubmit = (e?: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    if (isLoading) {
      toast.error('Please wait for the previous response to complete.');
      return;
    }
    sendMessage(input, attachmentFile, setAttachmentFile);
  };

  return (
    <div className="relative h-dvh transition-colors duration-200 ease-in-out flex flex-col" {...handlers}>      
      <AppHeader title="Chat" subtitle={persona_name || 'New Persona'}/>
      <AnimatePresence>
      {isDraggingOver && (
        <motion.div 
          className="absolute top-16 inset-4 pointer-events-none z-10 flex flex-col items-center justify-center gap-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <div className="text-sm dark:text-zinc-400 text-zinc-500">{"Images Only"}</div>
        </motion.div>
      )}
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col min-w-0 gap-6 pt-4 overflow-y-scroll scrollbar-hide px-4 relative">
        {messages.map((message, index) => (<PreviewMessage key={index} message={message}/>))}
        {isLoading && <ThinkingMessage />}
        <div ref={messagesEndRef}/>
      </div>
      
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
  );
}