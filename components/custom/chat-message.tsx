'use client';

import cx from 'classnames';
import Image from 'next/image';

import { ImagePreview } from './preview-attachment';

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import { Paperclip } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  file_path?: string | null;
}

export const PreviewMessage = ({message}: {message: Message}) => {
  console.log('PreviewMessage rendering. Message:', message);
  console.log('PreviewMessage - Attachment value:', message.file_path);

  return (
    <div className="w-full mx-auto max-w-3xl px-4 group/message" data-role={message.role}>
      <div className={cx('flex gap-4 px-3 py-2 w-fit max-w-[85%]', message.role === 'user' ? 'mr-auto' : 'ml-auto bg-muted/50 rounded-xl')}>
        <div className="flex flex-col gap-2 w-full">
          {message.content && (
             <div className="prose dark:prose-invert max-w-none"> 
               {message.content}
             </div>
          )}
          {message.file_path && (
            <div className="mt-2">
              <ImagePreview
                source={message.file_path}
                alt={message.content || "Attachment"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function InputMessage({
  personaId,
  input,
  setInput,
  isLoading,
  handleSubmit,
  attachmentFile,
  setAttachmentFile,
}: {
  personaId: string | null;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: () => void;
  attachmentFile: File | null;
  setAttachmentFile: (file: File | null) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(`input-${personaId || 'null'}`, '');

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || '';
      if (input !== finalValue) {
          setInput(finalValue);
      }
      requestAnimationFrame(adjustHeight);
    }
  }, [localStorageInput]);

  useEffect(() => {
    setLocalStorageInput(input);
    adjustHeight();
  }, [input, setLocalStorageInput]);

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
  }, [setAttachmentFile]);

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
      textareaRef.current?.focus();
    }

  }, [input, attachmentFile, isLoading, handleSubmit]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
     <div className="w-full mx-auto max-w-3xl px-4 pb-4 sticky bottom-0 bg-background">
       <div className="flex items-end gap-2 border rounded-xl p-2">
         <input
           type="file"
           ref={fileInputRef}
           onChange={handleFileChange}
           className="hidden"
           accept="image/*"
         />

         <Button
           variant="ghost"
           size="icon"
           onClick={triggerFileInput}
           disabled={isLoading || !!attachmentFile}
           aria-label="Attach image"
         >
           <Paperclip className="h-5 w-5" />
         </Button>

         <div className="flex flex-col gap-2 w-full">
           {previewUrl && (
             <div className="ml-1 mb-1">
               <ImagePreview
                 source={previewUrl}
                 onDelete={handleDeleteAttachment}
                 alt={attachmentFile?.name || "Selected image"}
               />
             </div>
           )}
           <textarea
             ref={textareaRef}
             value={input}
             onChange={handleInput}
             maxLength={500}
             className={cx(
               'prose dark:prose-invert',
               'w-full resize-none scrollbar-hide border-none focus:ring-0 focus:outline-none p-0 bg-transparent',
               'leading-tight'
             )}
             placeholder="Type your message..."
             rows={1}
             onKeyDown={(event) => {
               if (event.key === 'Enter' && !event.shiftKey) {
                 event.preventDefault();
                 submit();
               }
             }}
             disabled={isLoading}
           />
         </div>
       </div>
     </div>
  );
}

export const ThinkingMessage = () => {  
  return (
    <div className="w-full mx-auto max-w-3xl px-4 group/message" data-role="assistant">
      <div className={cx('flex gap-4 px-3 py-2 rounded-xl w-fit max-w-[85%] ml-auto')}>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Typing...
          </div>
        </div>
      </div>
    </div>
  );
};
