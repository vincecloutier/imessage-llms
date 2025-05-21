import { Message } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/frontend' : 'https://april-python.vercel.app/api/frontend';

export function useChatMessages({user_id, persona_id, initialMessages}: {user_id: string; persona_id: string; initialMessages: Message[];}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const initialPromptSent = useRef(false);

  useEffect(() => {
    const shouldSendInitialPrompt = initialMessages.length === 0 && messages.length === 0 && !initialPromptSent.current && !isResponding && persona_id === 'new';
    if (!shouldSendInitialPrompt) return;
    const sendInitialPrompt = async () => {
      setIsResponding(true);
      initialPromptSent.current = true; // to make sure we don't send the initial prompt more than once
      const formData = new FormData();
      const prompts = ["Hi there! Introduce yourself to me.", "Who's this?", "What's your name?", "Who are you?", "Say hi to me!"];
      formData.append('user_id', user_id);
      formData.append('persona_id', persona_id);
      formData.append('message', prompts[Math.floor(Math.random() * prompts.length)]); 
      try {
        const response = await fetch(API_URL, {method: 'POST', credentials: 'include', body: formData});
        const result = await response.json();
        setMessages([{role: 'assistant', content: result.message.content, created_at: new Date().toISOString()}]);
      } catch (err: any) {
        console.error("Initial prompt error:", err);
        toast.error(`Failed to connect to April.`, {description: 'Please contact support if the issue persists.'});
      } finally {
        setIsResponding(false);
      }
    };
    sendInitialPrompt();
  }, [initialMessages, messages, user_id, persona_id, isResponding]);

  const sendMessage = async (content: string, attachmentFile: File | null, setAttachmentFile: (file: File | null) => void) => {
    setIsResponding(true);
    const trimmedContent = content.trim();
    const userMessage: Message = { role: 'user', content: trimmedContent, created_at: new Date().toISOString() };
    if (attachmentFile) {
      userMessage.attachmentFile = attachmentFile;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (setAttachmentFile) setAttachmentFile(null);

    const formData = new FormData();
    formData.append('user_id', user_id);
    formData.append('persona_id', persona_id);
    formData.append('message', trimmedContent);
    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
    }

    try {
      const response = await fetch(API_URL, {method: 'POST', credentials: 'include', body: formData});
      const result = await response.json();
      setMessages((prev) => [...prev, {role: 'assistant', content: result.message.content, created_at: new Date().toISOString()}]);
    } catch (err: any) {
      console.error("Send message error:", err);
      toast.error(`Failed to connect to April.`, {description: 'Please contact support if the issue persists.'});
    } finally {
      setIsResponding(false);
    }
  };

  return {messages, isResponding, input, setInput, sendMessage};
} 