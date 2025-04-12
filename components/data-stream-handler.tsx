'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

export type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'sheet-delta'
    | 'image-delta'
    | 'title'
    | 'id'
    | 'clear'
    | 'finish';
  content: string;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream, setMessages, messages } = useChat({ id });
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      if (delta.type === 'text-delta' || delta.type === 'code-delta') {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          if (!lastMessage) return messages;

          const updatedMessages = [...messages];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + delta.content,
            parts: lastMessage.parts?.map(part => 
              part.type === 'text' 
                ? { ...part, text: part.text + delta.content }
                : part
            ) || [{ type: 'text', text: delta.content }]
          };
          return updatedMessages;
        });
      }
    });
  }, [dataStream, setMessages, messages]);

  return null;
}
