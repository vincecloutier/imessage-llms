'use client';

import {useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Message } from '@/lib/types';
import { useFileHandler } from '@/hooks/use-file-handler';
import { useFileInput } from '@/hooks/use-chat-file-input';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useKeyboardFocus } from '@/hooks/use-chat-keyboard-focus';

import { AppHeader } from '@/components/custom/app-header';
import { DisplayMessage, TypingMessage, ChatInput } from '@/components/custom/chat-parts';

export function Chat({ user_id, persona_id, persona_name, initialMessages }: { user_id: string; persona_id: string; persona_name: string; initialMessages: Message[];}) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // First get the file handler which manages the core file state
  const { attachmentFile, setAttachmentFile, handleFileAdded, handleFileRemoved } = useFileHandler(textareaRef);
  
  // Custom hooks for handling messages and API calls
  const { messages, isResponding, input, setInput, sendMessage } = useChatMessages({ initialMessages, user_id, persona_id });
  
  // Now use the file input hook with the handlers from useFileHandler
  const { isDraggingOver, handlers } = useFileInput(textareaRef, setInput, handleFileAdded, attachmentFile);
  
  useKeyboardFocus(textareaRef);

  // Auto-scroll to bottom when messages change
  useEffect(() => {messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [messages]);

  return (
    <div className="relative h-dvh transition-colors duration-200 ease-in-out flex flex-col" {...handlers}>      
      <AppHeader title="Chat" subtitle={persona_name} isAnonymous={persona_id === "new"}/>
      <AnimatePresence>
      {isDraggingOver && (
        <motion.div 
          className="absolute top-16 inset-4 pointer-events-none z-10 flex flex-col items-center justify-center gap-1 rounded-xl bg-muted/90" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <div className="text-sm text-muted-foreground">{"Images Only"}</div>
        </motion.div>
      )}
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col min-w-0 gap-6 pt-4 overflow-y-scroll scrollbar-hide px-4 relative">
        {messages.map((message, index) => (<DisplayMessage key={index} message={message}/>))}
        {isResponding && <TypingMessage />}
        <div ref={messagesEndRef}/>
      </div>
      
      <ChatInput
        input={input}
        setInput={setInput}
        isResponding={isResponding}
        handleSubmit={() => sendMessage(input, attachmentFile, setAttachmentFile)}
        attachmentFile={attachmentFile}
        handleFileAdded={handleFileAdded}
        handleFileRemoved={handleFileRemoved}
        textareaRef={textareaRef}
      />

      <div className="text-xs text-center pb-4 text-destructive">
        {persona_id === "new" && (<div> This conversation will not be saved. Please connect to your account to save your conversations. </div>)}
      </div>
      
    </div>
  );
}