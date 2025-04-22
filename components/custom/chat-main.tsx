'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { InputMessage, PreviewMessage, ThinkingMessage } from '@/components/custom/chat-message';
import { SidebarTrigger } from '../ui/sidebar';
import AuthButton from './logout-button';
import { BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage, Breadcrumb, } from '../ui/breadcrumb';
import { Separator } from '../ui/separator';

export function Chat({ user_id, id, initialMessages }: { user_id: string | null; id: string | null; initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [messages]);

  const sendMessage = async (message: string) => {
    if (!id || !message.trim()) return;

    const userMessage = {role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user_id,
          persona_id: id,
          message: message,
          attachment: null,
        }),
      });

      const result = await response.json();
      const aiMessage = {
        role: 'assistant',
        content: result.message?.content || 'Error: No response',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: 'error', role: 'assistant', content: 'Something went wrong: ' + err }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="relative h-dvh">
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

      <div className="flex flex-1 flex-col min-w-0 h-[calc(100%-4rem)] gap-6 pt-4 overflow-y-scroll scrollbar-hide px-4">
        {messages.map((message, index) => (
          <PreviewMessage
            key={index}
            message={message}
            isLoading={false}
          />
        ))}
        {isLoading && <ThinkingMessage />}
        <form className="w-full mx-auto" onSubmit={handleSubmit}>
          <InputMessage
            personaId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            attachments={[]}
          />
        </form>
        <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
      </div>
    </div>
  );
}