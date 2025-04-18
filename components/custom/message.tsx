'use client';

import { Message } from 'ai';
import cx from 'classnames';
import { motion } from 'framer-motion';

import { PreviewAttachment } from './preview-attachment';

import { Attachment, ChatRequestOptions } from 'ai';
import React, {
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

export const PreviewMessage = ({message, isLoading}: {message: Message, isLoading: boolean}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          'flex gap-4 px-3 py-2 w-fit max-w-[85%]',
          message.role === 'user'
            ? 'mr-auto'
            : 'ml-auto'
        )}
      >

        <div className="flex flex-col gap-2 w-full">
          <div className="prose dark:prose-invert">
          {/* TODO: modify this so we split newlines */}
          {message.content}
          </div>

          {message.experimental_attachments && (
            <div className="flex flex-row gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export function InputMessage({
  personaId,
  input,
  setInput,
  isLoading,
  handleSubmit,
  className,
  attachments,
}: {
  personaId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  attachments: Array<Attachment>;
  handleSubmit: (
    event?: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = textareaRef.current.scrollHeight + 2;
      const MAX_HEIGHT = 200; // maximum height in pixels
      if (newHeight > MAX_HEIGHT) {
        textareaRef.current.style.height = `${MAX_HEIGHT}px`;
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${newHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    `input-${personaId}`,
    ''
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submit = useCallback((event?: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event) event.preventDefault();

    if (input.trim().length === 0 && attachments.length === 0) {
        toast.error('Please enter a message or add an attachment.');
        return;
    }
    if (isLoading) {
        toast.error('Please wait for the previous response to complete.');
        return;
    }

    handleSubmit(event);

    if (textareaRef.current) {
      textareaRef.current?.focus();
    }
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        adjustHeight();
    }

  }, [input, attachments, isLoading, handleSubmit, width]);

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role="user"
    >
      <div
        className={cx(
          'flex gap-4 px-3 py-2 rounded-xl max-w-[85%]',
          'mr-auto'
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            className={cx(
              'prose dark:prose-invert min-h-[1em] max-h-[200px] overflow-auto resize-none scrollbar-hide',
              'border-none focus:ring-0 focus:outline-none p-0',
              className
            )}
            rows={1}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                submit(event);
              }
            }}
          />
          {attachments && attachments.length > 0 && (
            <div className="flex flex-row gap-2">
              {attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url || attachment.name}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


export const ThinkingMessage = () => {  
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1}}
      data-role="assistant"
    >
      <div
        className={cx(
          'flex gap-4 px-3 py-2 rounded-xl w-fit max-w-[85%]',
          'ml-auto'
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Typing...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
