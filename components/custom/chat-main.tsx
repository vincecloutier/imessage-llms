'use client';

import {useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useFileHandler } from '@/hooks/use-file-handler';
import { AppHeader } from '@/components/custom/app-header';
import { useFileInput } from '@/hooks/use-chat-file-input';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { Message, Persona, Profile, User } from '@/lib/types';
import { useKeyboardFocus } from '@/hooks/use-chat-keyboard-focus';
import { DisplayMessage, TypingMessage, ChatInput } from '@/components/custom/chat-parts';

const INITIAL_INPUT_AREA_HEIGHT = 70; // approximate initial height of the input area + bottom margin
const BOTTOM_SPACING = 16; // additional space between last message and input area to bottom-4 (1rem)

export function Chat({ user, persona, profile, initialMessages }: { user: User; persona: Persona; profile: Profile | null, initialMessages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement | null>(null); // ref for the input container
  const [inputAreaHeight, setInputAreaHeight] = useState(INITIAL_INPUT_AREA_HEIGHT); // state for height

  // first get the file handler which manages the core file state
  const { attachmentFile, setAttachmentFile, handleFileAdded, handleFileRemoved } = useFileHandler(textareaRef);
  
  // custom hook for handling messages and API calls
  const { messages, isResponding, input, setInput, sendMessage } = useChatMessages({ user_id: user.id, persona_id: persona.id, initialMessages });
  
  // now use the file input hook with the handlers from useFileHandler
  const { isDraggingOver, handlers } = useFileInput(textareaRef, setInput, handleFileAdded, attachmentFile);
  
  // custom hook for handling keyboard focus
  useKeyboardFocus(textareaRef);

  // auto-scroll to bottom when messages change OR input area height changes
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [messages, inputAreaHeight]);
  
  // effect to observe input container height so we can dynamically adjust the padding-bottom of the message container
  useEffect(() => {
    const inputElement = inputContainerRef.current;
    if (!inputElement) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        setInputAreaHeight(height + BOTTOM_SPACING);
      }
    });
    resizeObserver.observe(inputElement);
    return () => {resizeObserver.unobserve(inputElement);};
  }, []);

  // Function to determine if we should show a date separator
  const shouldShowDateSeparator = (message: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const currentDate = new Date(message.created_at || Date.now());
    const prevDate = new Date(prevMessage.created_at || Date.now());
    return currentDate.toDateString() !== prevDate.toDateString();
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden transition-colors duration-200 ease-in-out" {...handlers}>
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

      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 pt-4" style={{ paddingBottom: `${inputAreaHeight}px` }}>
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <DisplayMessage 
              name={(message.role === 'user' ? profile?.attributes?.name || 'User' : persona.attributes?.name || 'Assistant') as string}
              key={index} 
              message={message} 
              showDateSeparator={shouldShowDateSeparator(message, index)}
            />
          ))}
          {isResponding && <TypingMessage name={(persona.attributes?.name || 'Assistant') as string} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div ref={inputContainerRef} className="absolute bottom-0 left-0 right-0">
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