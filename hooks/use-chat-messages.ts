import { useState } from 'react';
import { toast } from 'sonner';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  file_path?: string | null;
};

type ChatMessagesProps = {
  initialMessages: Message[];
  user_id: string | null;
  persona_id: string | null;
};

export function useChatMessages({ initialMessages, user_id, persona_id }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages?.map(msg => ({ ...msg, file_path: msg.file_path })) || []
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (
    messageContent: string, 
    attachmentFile: File | null,
    setAttachmentFile: (file: File | null) => void
  ) => {
    const trimmedContent = messageContent.trim();
    
    if (!persona_id || (!trimmedContent && !attachmentFile)) {
      toast.error('Please enter a message or add an attachment.');
      return;
    }
    
    setIsLoading(true);

    const userMessage: Message = { role: 'user', content: trimmedContent };
    let tempAttachmentUrl: string | null = null;

    if (attachmentFile) {
      tempAttachmentUrl = URL.createObjectURL(attachmentFile);
      userMessage.file_path = tempAttachmentUrl;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachmentFile(null);

    const formData = new FormData();
    formData.append('user_id', user_id || '');
    formData.append('persona_id', persona_id);
    formData.append('message', trimmedContent);
    
    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
    }

    let responseReceived = false;

    try {
      const response = await fetch('http://localhost:3001/api/frontend', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      responseReceived = true;

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: result.message.content 
      };
      
      setMessages((prev) => {
        const updatedMessages = prev.map(msg =>
          msg === userMessage
            ? { ...msg, file_path: msg.file_path }
            : msg
        );
        return [...updatedMessages, assistantMessage];
      });
      
      if (tempAttachmentUrl) {
        URL.revokeObjectURL(tempAttachmentUrl);
      }
      
    } catch (err: any) {
      if (tempAttachmentUrl && !responseReceived) {
        URL.revokeObjectURL(tempAttachmentUrl);
      }
      console.error("Send message error:", err);
      toast.error(`Failed to send message: ${err.message}`);
      setMessages((prev) => [
        ...prev.filter(msg => msg !== userMessage),
        { 
          role: 'assistant', 
          content: `Error: ${err.message || 'Could not send message'}` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    input,
    setInput,
    sendMessage
  };
} 