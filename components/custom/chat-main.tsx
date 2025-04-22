'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { InputMessage, PreviewMessage, ThinkingMessage } from '@/components/custom/chat-message';
import { SidebarTrigger } from '../ui/sidebar';
import AuthButton from './logout-button';
import { BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage, Breadcrumb, } from '../ui/breadcrumb';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  attachment?: string | null;
};

export function Chat({ user_id, id, initialMessages }: { user_id: string | null; id: string | null; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });}, [messages]);

  const sendMessage = async (message: string, file: File | null) => {
    if (!id || (!message.trim() && !file)) {
      toast.error('Please enter a message or add an attachment.');
      return;
    }
    setIsLoading(true);

    const userMessage: Message = { role: 'user', content: message };
    if (file) {
      userMessage.attachment = URL.createObjectURL(file);
    }
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachmentFile(null);

    const formData = new FormData();
    formData.append('user_id', user_id || '');
    formData.append('persona_id', id);
    formData.append('message', message);
    if (file) {
      formData.append('attachment', file);
    }

    try {
      if (userMessage.attachment && userMessage.attachment.startsWith('blob:')) {
        URL.revokeObjectURL(userMessage.attachment);
      }

      const response = await fetch('http://localhost:3001/api/frontend', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: result.message.content };
      if (result.message.attachment) {
        assistantMessage.attachment = result.message.attachment;
      }
       setMessages((prev) => {
         const updatedMessages = prev.map(msg => 
             msg === userMessage && msg.attachment?.startsWith('blob:') 
             ? { ...msg, attachment: result.user_message_attachment_url || null }
             : msg
         );
         return [...updatedMessages, assistantMessage];
       });
       
    } catch (err: any) {
       if (userMessage.attachment && userMessage.attachment.startsWith('blob:')) {
        URL.revokeObjectURL(userMessage.attachment);
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
    sendMessage(input, attachmentFile);
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
          />
        ))}
        {isLoading && <ThinkingMessage />}
        <InputMessage
          personaId={id}
          input={input}
          setInput={setInput}
          handleSubmit={() => handleSubmit()}
          isLoading={isLoading}
          attachmentFile={attachmentFile}
          setAttachmentFile={setAttachmentFile}
        />
        <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
      </div>
    </div>
  );
}