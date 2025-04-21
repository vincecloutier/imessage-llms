import {
  CoreAssistantMessage,
  CoreMessage,
  CoreToolMessage,
  Message,
  ToolInvocation,
  ToolContent,
} from 'ai';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Database } from '@/lib/supabase/types';

type DBMessage = Database['public']['Tables']['messages']['Row'];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function convertToUIMessages(messages: Array<DBMessage>): Array<Message> {
  return messages.reduce((personaMessages: Array<Message>, message) => {

    let textContent = '';
    let toolInvocations: Array<ToolInvocation> = [];

    try {
      const parsedContent = JSON.parse(message.content?.toString() ?? '');

      if (Array.isArray(parsedContent)) {
        for (const content of parsedContent) {
          if (content.type === 'text') {
            textContent += content.text;
          } else if (content.type === 'tool-call') {
            toolInvocations.push({
              state: 'call',
              toolCallId: content.toolCallId,
              toolName: content.toolName,
              args: content.args,
            });
          }
        }
      } else {
        textContent = message.content?.toString() ?? '';
      }
    } catch {
      // If parsing fails, treat as plain text
      textContent = message.content?.toString() ?? '';
    }

    personaMessages.push({
      id: message.id,
      role: message.role as Message['role'],
      content: textContent,
      toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
    });

    return personaMessages;
  }, []);
}

export function sanitizeResponseMessages(
  messages: Array<CoreToolMessage | CoreAssistantMessage>
): Array<CoreToolMessage | CoreAssistantMessage> {
  let toolResultIds: Array<string> = [];

  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (typeof message.content === 'string') return message;

    const sanitizedContent = message.content.filter((content) =>
      content.type === 'tool-call'
        ? toolResultIds.includes(content.toolCallId)
        : content.type === 'text'
          ? content.text.length > 0
          : true
    );

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0
  );
}

export function getMostRecentUserMessage(messages: Array<CoreMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

// Add fetcher function for SWR
export async function fetcher<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}
