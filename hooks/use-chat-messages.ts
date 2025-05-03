import { Message } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export function useChatMessages({user_id, persona_id, initialMessages}: {user_id: string; persona_id: string; initialMessages: Message[];}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const initialPromptSent = useRef(false);

  useEffect(() => {
    if (initialMessages.length === 0 && messages.length === 0 && !initialPromptSent.current && !isResponding && persona_id === 'new') {
      const sendInitialPrompt = async () => {
        setIsResponding(true);
        initialPromptSent.current = true;
        const formData = new FormData();
        const prompts = ["Hi there! Introduce yourself to me.", "Who's this?", "What's your name?", "Who are you?", "Say hi to me!"];
        formData.append('user_id', user_id);
        formData.append('persona_id', persona_id);
        formData.append('message', prompts[Math.floor(Math.random() * prompts.length)]); 
        try {
          const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/frontend' : 'https://april-python.vercel.app/api/frontend';
          const response = await fetch(url, {method: 'POST', credentials: 'include', body: formData});
          const result = await response.json();
          setMessages([{role: 'assistant', content: result.message.content}]);
        } catch (err: any) {
          initialPromptSent.current = false;
        } finally {
          setIsResponding(false);
        }
      };
      sendInitialPrompt();
    }
  }, [initialMessages, messages, user_id, persona_id, isResponding]);

  const sendMessage = async (content: string, attachmentFile: File | null, setAttachmentFile: (file: File | null) => void) => {
    const trimmed = content.trim();
    
    if (!trimmed && !attachmentFile) {
      toast.error('Please enter a message or add an attachment.');
      return;
    }
    if (isResponding) {
      toast.error('Please wait for the previous response to complete.');
      return;
    }
    
    setIsResponding(true);

    const userMessage: Message = {role: 'user', content: trimmed};

    if (attachmentFile) {
      userMessage.attachmentFile = attachmentFile;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (setAttachmentFile) setAttachmentFile(null);

    const formData = new FormData();
    formData.append('user_id', user_id);
    formData.append('persona_id', persona_id);
    formData.append('message', trimmed);
    
    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
    }

    try {
      const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/frontend' : 'https://april-python.vercel.app/api/frontend';

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const result = await response.json();
      setMessages((prev) => [...prev, {role: 'assistant', content: result.message.content}]);
    } catch (err: any) {
      console.error("Send message error:", err);
      toast.error(`Failed to send message. Please report this issue by emailing support@aprilintelligence.com`);
    } finally {
      setIsResponding(false);
    }
  };
  
  return {messages, isResponding, input, setInput, sendMessage};
} 