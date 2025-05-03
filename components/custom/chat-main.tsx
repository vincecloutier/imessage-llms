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
    <div className="h-dvh flex flex-col relative transition-colors duration-200 ease-in-out" {...handlers}>
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

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-4 pb-20 min-h-0">
        <div className="flex flex-col gap-4">
            {messages.map((message, index) => (<DisplayMessage key={index} message={message}/>))}
            {isResponding && <TypingMessage />}
            <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 px-4 z-5 pointer-events-none">
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
    </div>
  );
}