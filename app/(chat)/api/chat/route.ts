import {
  convertToCoreMessages,
  CoreMessage,
  Message,
  StreamData,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { getPersonaById, getSession } from '@/db/cached-queries';
import {
  savePersona,
  saveMessages,
  deletePersonaById,
} from '@/db/mutations';
import { createClient } from '@/lib/supabase/server';
import { MessageRole } from '@/lib/supabase/types';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';


const systemPrompt = 'You are a friendly assistant! Keep your responses concise and helpful.';

import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const customModel = () => {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  return openrouter.chat("google/gemini-2.0-flash-001");
};

export const maxDuration = 60;

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) { 
    throw new Error('Unauthorized');
  }

  return user;
}

// Add helper function to format message content for database storage
function formatMessageContent(message: CoreMessage): string {
  // For user messages, store as plain text
  if (message.role === 'user') {
    return typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);
  }

  // For tool messages, format as array of tool results
  if (message.role === 'tool') {
    return JSON.stringify(
      message.content.map((content) => ({
        type: content.type || 'tool-result',
        toolCallId: content.toolCallId,
        toolName: content.toolName,
        result: content.result,
      }))
    );
  }

  // For assistant messages, format as array of text and tool calls
  if (message.role === 'assistant') {
    if (typeof message.content === 'string') {
      return JSON.stringify([{ type: 'text', text: message.content }]);
    }

    return JSON.stringify(
      message.content.map((content) => {
        if (content.type === 'text') {
          return {
            type: 'text',
            text: content.text,
          };
        }
      })
    );
  }

  return '';
}

export async function POST(request: Request) {
  const {
    id,
    messages,
  }: { id: string; messages: Array<Message>; } =
    await request.json();

  const user = await getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  try {
    const persona = await getPersonaById(id);

    if (!persona) {
      await savePersona({ id, userId: user.id, name: "New Persona" });
    } else if (persona.user_id !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await saveMessages({
      personaId: id,
      messages: [
        {
          id: generateUUID(),
          persona_id: id,
          role: userMessage.role as MessageRole,
          content: formatMessageContent(userMessage),
          created_at: new Date().toISOString(),
        },
      ],
    });

    const streamingData = new StreamData();

    const result = await streamText({
      model: customModel(),
      system: systemPrompt,
      messages: coreMessages,
      maxSteps: 5,
      onFinish: async ({ response }) => {
        if (user && user.id) {
          try {
            const responseMessagesWithoutIncompleteToolCalls =
              sanitizeResponseMessages(response.messages);

            await saveMessages({
              personaId: id,
              messages: responseMessagesWithoutIncompleteToolCalls.map(
                (message) => {
                  const messageId = generateUUID();

                  if (message.role === 'assistant') {
                    streamingData.appendMessageAnnotation({
                      messageIdFromServer: messageId,
                    });
                  }

                  return {
                    id: messageId,
                    persona_id: id,
                    role: message.role as MessageRole,
                    content: formatMessageContent(message),
                    created_at: new Date().toISOString(),
                  };
                }
              ),
            });
          } catch (error) {
            console.error('Failed to save chat:', error);
          }
        }

        streamingData.close();
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'stream-text',
      },
    });

    return result.toDataStreamResponse({
      data: streamingData,
    });
  } catch (error) {
    console.error('Error in persona route:', error);
    if (error instanceof Error && error.message === 'persona ID already exists') {
      // If persona already exists, just continue with the message saving
      await saveMessages({
        personaId: id,
        messages: [
          {
            id: generateUUID(),
            persona_id: id,
            role: userMessage.role as MessageRole,
            content: formatMessageContent(userMessage),
            created_at: new Date().toISOString(),
          },
        ],
      });
    } else {
      throw error; // Re-throw other errors
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const user = await getUser();

  try {
    const persona = await getPersonaById(id);

    if (!persona) {
      return new Response('persona not found', { status: 404 });
    }

    if (persona.user_id !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deletePersonaById(id, user.id);

    return new Response('persona deleted', { status: 200 });
  } catch (error) {
    console.error('Error deleting persona:', error);
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
