'use client';

import cx from 'classnames';
import { Paperclip, ArrowUp } from 'lucide-react';
import React, { useRef, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

import { Message } from '@/lib/types';
import { ImagePreview } from '@/components/custom/chat-preview';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DateSeparator = ({ date }: { date: Date }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-border ml-4.5" />
      <span className="text-xs text-muted-foreground">
        {format(date, 'MMMM d, yyyy')}
      </span>
      <div className="h-px flex-1 bg-border mr-4.5" />
    </div>
  );
};

export const DisplayMessage = ({name, message, showDateSeparator}: {name: string, message: Message, showDateSeparator?: boolean}) => {
  const messageDate = new Date(message.created_at || Date.now());
  const avatarUrl = message.role === 'user' ? '/user-avatar.png' : '/assistant-avatar.png';
  const isUser = message.role === 'user';

  return (
    <>
      {showDateSeparator && <DateSeparator date={messageDate} />}
      <div className={cx(
        "px-4 py-2",
        isUser ? "flex justify-end" : "flex justify-start"
      )} data-role={message.role}>
        {!isUser && (
          <div className="flex-shrink-0 mr-2 self-end -mb-4">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className={cx("rounded-lg bg-muted")}>{name}</AvatarFallback>
            </Avatar>
          </div>
        )}
        <div className={cx("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}>
          <div className={cx("flex-1", isUser && "text-right")}>
            {(message.file_path || message.attachmentFile) && (
              <div className="mt-1">
                <ImagePreview source={message.attachmentFile || message.file_path} alt={message.content || "Attachment"} />
              </div>
            )}
            {message.content && (
              <div className={cx(
                "text-sm inline-block relative group",
                isUser ? "bg-primary text-primary-foreground rounded-2xl rounded-br-none px-4 py-2" : "bg-muted text-secondary-foreground rounded-2xl rounded-bl-none px-4 py-2"
              )}>
                <div className="text-left">
                  {message.content}
                </div>
                <span className={cx("text-[10px] block mt-1", isUser ? "text-primary-foreground/70" : "text-secondary-foreground/70")}>
                  {format(messageDate, 'h:mm a')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const TypingMessage = ({name}: {name: string}) => {
  return (
    <div className="px-4 py-2 flex justify-start" data-role="assistant">
      <div className="flex-shrink-0 mr-2 self-end -mb-4">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src="/assistant-avatar.png" alt="Assistant" />
          <AvatarFallback className="rounded-lg bg-muted">{name}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div className="flex-1">
          <div className="bg-muted text-secondary-foreground rounded-2xl rounded-bl-none px-4 py-2">
            <div className="flex gap-1">
              <span className="animate-smooth-bounce">●</span>
              <span className="animate-smooth-bounce" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="animate-smooth-bounce" style={{ animationDelay: '0.4s' }}>●</span>
            </div>
            <span className={cx("text-[10px] block mt-1")}>
              {format(new Date(), 'h:mm a')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export function ChatInput({input, setInput, isResponding, handleSubmit, attachmentFile, handleFileAdded, handleFileRemoved, textareaRef}:{input: string, setInput: (value: string) => void, isResponding: boolean, handleSubmit: () => void, attachmentFile: File | null, handleFileAdded: (file: File) => boolean, handleFileRemoved: () => void, textareaRef: React.RefObject<HTMLTextAreaElement>}) {
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
    if (textareaRef.current) textareaRef.current.focus();
  }, [input, isResponding, handleSubmit, textareaRef]);

  return (
    <div className="relative">
      {attachmentFile && (
        <div className="px-2">
          <ImagePreview source={attachmentFile} onDelete={handleFileRemoved} alt={attachmentFile.name || "Selected image"} />
        </div>
      )}
      <div className="border-t border-b border-r bg-sidebar border-input overflow-hidden">
        <div className="flex items-center w-full px-4 py-2">
          <button onClick={() => fileInputRef.current?.click()} className="shrink-0 text-muted-foreground hover:text-foreground mr-2">
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
            onChange={(event) => {setInput(event.target.value.replace(/\n/g, ''));}} // remove newlines
            maxLength={250}
            className={cx(
              'grow resize-none scrollbar-hide border-none focus:ring-0 focus:outline-hidden py-1 bg-sidebar',
              'leading-tight text-sm md:text-base',
              'min-h-[24px] max-h-[120px]'
            )}
            rows={1}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !isResponding && (attachmentFile || (0 < input.trim().length && input.trim().length <= 250))){
                event.preventDefault(); 
                submit();
              }
            }}
          />

          <button
            onClick={submit}
            disabled={isResponding || (input.trim().length === 0 && !attachmentFile)}
            className={cx(
              "shrink-0 rounded-full p-2 ml-2",
              (isResponding || (input.trim().length === 0 && !attachmentFile))
              ? "text-muted-foreground bg-muted"
              : "text-primary-foreground bg-primary hover:bg-primary/90"
            )}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}