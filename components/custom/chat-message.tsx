'use client';

import cx from 'classnames';
import { ImagePreview } from './preview-attachment';
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Paperclip, ArrowUp } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  file_path?: string | null;
}

export const PreviewMessage = ({message}: {message: Message}) => {
  return (
    <div className="w-full mx-auto max-w-3xl px-4 flex items-end gap-2 mb-4" data-role={message.role}>
      <div className={cx(
        'flex flex-col gap-2 px-4 py-3 rounded-2xl max-w-[75%]',
        message.role === 'user' ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-gray-100 dark:bg-gray-800'
      )}>
        {message.file_path && (<ImagePreview source={message.file_path} alt={message.content || "Attachment"} />)}
        <div className="prose dark:prose-invert max-w-none"> {message.content} </div>
      </div>
    </div>
  );
};

export const ThinkingMessage = () => {
  return (
    <div className="w-full mx-auto max-w-3xl px-4 flex items-end gap-2 mb-4" data-role="assistant">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
        <span className="text-sm font-semibold">AI</span>
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-800">
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
  isLoading,
  handleSubmit,
  attachmentFile,
  setAttachmentFile,
  textareaRef
}:{
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: () => void;
  attachmentFile: File | null;
  setAttachmentFile: (file: File | null) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!attachmentFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(attachmentFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [attachmentFile]);

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

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size exceeds 5MB limit.");
          return;
        }
        if (!file.type.startsWith('image/')) {
           toast.error("Please select an image file.");
           return;
        }
        setAttachmentFile(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = useCallback(() => {
    setAttachmentFile(null);
    textareaRef.current?.focus();
  }, [setAttachmentFile, textareaRef]);

  const submit = useCallback(() => {
    if (input.trim().length === 0 && !attachmentFile) {
        toast.error('Please enter a message or add an attachment.');
        return;
    }
    if (isLoading) {
        toast.error('Please wait for the previous response to complete.');
        return;
    }
    handleSubmit();

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }

  }, [input, attachmentFile, isLoading, handleSubmit, textareaRef]);

  return (
    <div className="w-full mx-auto max-w-3xl px-4 mt-4">
              {previewUrl && attachmentFile && (
          <div className="px-4 pb-3">
            <ImagePreview
              source={previewUrl}
              onDelete={handleDeleteAttachment}
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
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            maxLength={500}
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
            disabled={isLoading}
          />
          
          <button 
            onClick={submit}
            disabled={isLoading || (input.trim().length === 0 && !attachmentFile)}
            className={cx(
              "flex-shrink-0 rounded-full p-2 ml-2", 
              (isLoading || (input.trim().length === 0 && !attachmentFile)) 
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