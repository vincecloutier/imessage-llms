'use client';

import {useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Message } from '@/lib/types';
import { useFileHandler } from '@/hooks/use-file-handler';
import { useFileInput } from '@/hooks/use-chat-file-input';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useKeyboardFocus } from '@/hooks/use-chat-keyboard-focus';

import { DisplayMessage, TypingMessage, ChatInput } from '@/components/custom/chat-parts';
import {User} from '@supabase/supabase-js';
import {Persona, Profile} from '@/lib/types';
import { AppHeader } from '@/components/custom/app-header';

export function Chat({ user, persona, profile, initialMessages }: { user: User; persona: Persona; profile: Profile | null, initialMessages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // First get the file handler which manages the core file state
  const { attachmentFile, setAttachmentFile, handleFileAdded, handleFileRemoved } = useFileHandler(textareaRef);
  
  // Custom hooks for handling messages and API calls
  const { messages, isResponding, input, setInput, sendMessage } = useChatMessages({ user_id: user.id, persona_id: persona.id, initialMessages });
  
  // Now use the file input hook with the handlers from useFileHandler
  const { isDraggingOver, handlers } = useFileInput(textareaRef, setInput, handleFileAdded, attachmentFile);
  
  useKeyboardFocus(textareaRef);

  // Auto-scroll to bottom when messages change
  useEffect(() => {messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [messages]);

  return (
    <div className="h-dvh flex flex-col transition-colors duration-200 ease-in-out" {...handlers}>
      <AppHeader user={user} persona={persona} profile={profile}/>
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

      <div className="flex-1 flex flex-col min-w-0 gap-4 pt-4 overflow-y-scroll scrollbar-hide px-4 relative">
        {messages.map((message, index) => (<DisplayMessage key={index} message={message}/>))}
        {isResponding && <TypingMessage />}
        <div ref={messagesEndRef} />

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
      </div>

      <div className="text-xs text-center text-destructive px-4 pb-4">
        {persona.id === "new" && (<div> This conversation will not be saved. Please connect to your account to save your conversations. </div> )}
      </div>
    </div>
  );
}