'use client';

import cx from 'classnames';
import { ImagePreview } from './preview-attachment';
import React, { useRef, useEffect, useCallback } from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';
import { Message } from '@/lib/types';

export const PreviewMessage = ({message}: {message: Message}) => {
  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (message.file_path && message.file_path.startsWith('blob:')) {
        URL.revokeObjectURL(message.file_path);
      }
    };
  }, [message.file_path]);

  return (
    <div className="w-full mx-auto max-w-3xl px-4 flex flex-col mb-4" data-role={message.role}>
      {(message.file_path || message.attachmentFile) && (
        <div className="self-end">
          <ImagePreview 
            source={message.attachmentFile || message.file_path} 
            alt={message.content || "Attachment"} 
          />
        </div>
      )}
      <div className={cx(
        'flex flex-col gap-2 px-4 py-3 rounded-2xl max-w-[75%]',
        message.role === 'user' ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-gray-100 dark:bg-gray-800'
      )}>
        <div className="prose dark:prose-invert max-w-none"> {message.content} </div>
      </div>
    </div>
  );
};

export const ThinkingMessage = () => {
  return (
    <div className="w-full mx-auto max-w-3xl px-4 flex items-end gap-2 mb-4" data-role="assistant">
      <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
        <div className="flex gap-1">
          <span className="animate-bounce">●</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
        </div>
      </div>
    </div>
  );
};

export function InputMessage({
  input,
  setInput,
  isResponding,
  handleSubmit,
  attachmentFile,
  handleFileAdded,
  handleFileRemoved,
  textareaRef
}:{
  input: string;
  setInput: (value: string) => void;
  isResponding: boolean;
  handleSubmit: () => void;
  attachmentFile: File | null;
  handleFileAdded: (file: File) => boolean;
  handleFileRemoved: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [textareaRef]);

  useEffect(() => {adjustHeight();}, [input, adjustHeight]);

  const submit = useCallback(() => {
    handleSubmit();

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, [input, isResponding, handleSubmit, textareaRef]);

  return (
    <div className="w-full mx-auto max-w-3xl px-4 pb-4">
          {attachmentFile && (
          <div className="px-4 pb-3">
            <ImagePreview
              source={attachmentFile}
              onDelete={handleFileRemoved}
              alt={attachmentFile.name || "Selected image"}
            />
          </div>
        )}
      <div className="border rounded-full shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center w-full px-4 py-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 mr-2"
          >
            <Paperclip size={18}/>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(event) => {if (event.target.files?.[0]) {handleFileAdded(event.target.files?.[0]);}}}
            className="hidden"
            accept="image/*"
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => {setInput(event.target.value);}}
            maxLength={300}
            className={cx(
              'flex-grow resize-none scrollbar-hide border-none focus:ring-0 focus:outline-none py-1 bg-transparent',
              'leading-tight text-sm md:text-base',
              'min-h-[24px] max-h-[120px]'
            )}
            rows={1}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
          />

          <button
            onClick={submit}
            disabled={isResponding || (input.trim().length === 0 && !attachmentFile)}
            className={cx(
              "flex-shrink-0 rounded-full p-2 ml-2",
              (isResponding || (input.trim().length === 0 && !attachmentFile))
              ? "text-gray-400 bg-gray-100 dark:bg-gray-800"
              : "text-white bg-blue-500 hover:bg-blue-600"
            )}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}