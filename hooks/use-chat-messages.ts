import { Message } from '@/lib/types';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

export function useChatMessages({user_id, persona_id, initialMessages}: {user_id: string | null;  persona_id: string | null; initialMessages: Message[];}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isResponding, setIsResponding] = useState(false);

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
    setAttachmentFile(null);

    const formData = new FormData();
    formData.append('user_id', user_id || '');
    formData.append('persona_id', persona_id || '');
    formData.append('message', trimmed);
    
    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
    }

    try {
      const response = await fetch('http://localhost:3001/api/frontend', {
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