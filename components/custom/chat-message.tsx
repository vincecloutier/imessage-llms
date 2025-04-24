'use client';

import cx from 'classnames';

import { ImagePreview } from './preview-attachment';

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { toast } from 'sonner';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  file_path?: string | null;
}

export const PreviewMessage = ({message}: {message: Message}) => {
  return (
    <div className="w-full mx-auto max-w-3xl px-4 group/message" data-role={message.role}>
      <div className={cx('flex flex-col gap-2 px-3 py-2 w-fit max-w-[85%]', message.role === 'user' ? 'ml-auto bg-blue-500 text-white rounded-lg' : 'mr-auto' )}>
        {message.file_path && (<ImagePreview source={message.file_path} alt={message.content || "Attachment"} />)}
          <div className="prose dark:prose-invert max-w-none"> 
            {message.content}
          </div>
      </div>
    </div>
  );
};

export const ThinkingMessage = () => {
  return (
    <div className="w-full mx-auto max-w-3xl px-4 group/message" data-role="assistant">
      <div className={cx('px-3 py-2 w-fit max-w-[85%] ml-auto text-muted-foreground')}>
        Typing...
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
    <div className="w-full mx-auto max-w-3xl px-4">
       <div className="flex gap-4 px-3 py-2 w-fit max-w-[85%]">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="flex flex-col gap-2 w-full rounded-lg bg-blue-500 text-white">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          maxLength={1000}
          className={cx(
            'w-full resize-none scrollbar-hide border-none focus:ring-0 focus:outline-none p-0 bg-transparent',
            'leading-tight text-sm md:text-base',
            'min-h-[24px]'
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
        {previewUrl && attachmentFile && (
            <ImagePreview
              source={previewUrl}
              onDelete={handleDeleteAttachment}
              alt={attachmentFile.name || "Selected image"}
            />
        )}
      </div>
    </div>
    </div>
  );
}