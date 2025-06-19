'use client'

import cx from 'classnames'
import { format } from 'date-fns'
import React, { useRef, useCallback } from 'react'

import { Message, Persona } from '@/lib/types'
import { Paperclip, ArrowUp } from 'lucide-react'
import { ImagePreview } from '@/components/custom/chat-preview'
import { PersonaAvatar } from '@/components/custom/form-persona'

const DateSeparator = ({ date }: { date: Date }) => {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="h-px flex-1 bg-border ml-4.5" />
      <span className="text-xs text-muted-foreground">{format(date, 'MMMM d, yyyy')}</span>
      <div className="h-px flex-1 bg-border mr-4.5" />
    </div>
  )
}

export const DisplayMessage = ({
  persona,
  message,
  showDateSeparator,
}: {
  persona: Persona
  message: Message
  showDateSeparator?: boolean
}) => {
  const messageDate = new Date(message.created_at || Date.now())
  const isUser = message.role === 'user'

  return (
    <>
      {showDateSeparator && <DateSeparator date={messageDate} />}
      <div
        className={cx('px-4 my-3', isUser ? 'flex justify-end' : 'flex justify-start')}
        data-role={message.role}
      >
        {!isUser && (
          <div className="flex-shrink-0 mr-2 self-end -mb-4">
            <PersonaAvatar personaId={persona.id} personaName={persona.display_name} />
          </div>
        )}
        <div className={cx('flex flex-col gap-1 max-w-[80%]', isUser && 'items-end')}>
          <div className={cx('flex-1', isUser && 'text-right')}>
            {(message.file_path || message.attachmentFile) && (
              <div className="mt-1">
                <ImagePreview
                  source={message.attachmentFile || message.file_path}
                  alt={message.content || 'Attachment'}
                />
              </div>
            )}
            {message.content && (
              <div
                className={cx(
                  'text-sm inline-block relative group',
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none px-4 py-2'
                    : 'bg-muted text-secondary-foreground rounded-2xl rounded-bl-none px-4 py-2'
                )}
              >
                <div className="text-left">{message.content}</div>
                <span
                  className={cx(
                    'text-[10px] block mt-1',
                    isUser ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'
                  )}
                >
                  {format(messageDate, 'h:mm a')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export const TypingMessage = ({ persona }: { persona: Persona }) => {
  return (
    <div className="px-4 my-3 flex justify-start" data-role="assistant">
      <div className="flex-shrink-0 mr-2 self-end -mb-4">
        <PersonaAvatar personaId={persona.id} personaName={persona.display_name} />
      </div>
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div className="flex-1">
          <div className="bg-muted text-secondary-foreground rounded-2xl rounded-bl-none px-4 py-2">
            <div className="flex gap-1">
              <span className="animate-smooth-bounce">●</span>
              <span className="animate-smooth-bounce" style={{ animationDelay: '0.2s' }}>
                ●
              </span>
              <span className="animate-smooth-bounce" style={{ animationDelay: '0.4s' }}>
                ●
              </span>
            </div>
            <span className={cx('text-[10px] block mt-1')}>{format(new Date(), 'h:mm a')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export function ChatInput({
  input,
  setInput,
  isResponding,
  handleSubmit,
  attachmentFile,
  handleFileAdded,
  handleFileRemoved,
  textareaRef,
}: {
  input: string
  setInput: (value: string) => void
  isResponding: boolean
  handleSubmit: () => void
  attachmentFile: File | null
  handleFileAdded: (file: File) => boolean
  handleFileRemoved: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submit = useCallback(() => {
    handleSubmit()
    if (textareaRef.current) textareaRef.current.focus()
  }, [input, isResponding, handleSubmit, textareaRef])

  return (
    <div className="relative">
      {attachmentFile && (
        <div className="px-2">
          <ImagePreview
            source={attachmentFile}
            onDelete={handleFileRemoved}
            alt={attachmentFile.name || 'Selected image'}
          />
        </div>
      )}
      <div className="border-t border-b border-r bg-sidebar border-input overflow-hidden">
        <div className="flex items-center w-full px-4 h-12">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 text-muted-foreground hover:text-foreground mr-2"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(event) => {
              if (event.target.files?.[0]) {
                handleFileAdded(event.target.files?.[0])
              }
            }}
            className="hidden"
            accept="image/*"
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value.replace(/\n/g, ''))
            }} // remove newlines
            maxLength={150}
            className={cx(
              'grow resize-none scrollbar-hide border-none focus:ring-0 focus:outline-hidden bg-sidebar',
              'leading-tight text-md'
            )}
            rows={1}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !isResponding &&
                (attachmentFile || (0 < input.trim().length && input.trim().length <= 250))
              ) {
                event.preventDefault()
                submit()
              }
            }}
          />

          <button
            onClick={submit}
            disabled={isResponding || (input.trim().length === 0 && !attachmentFile)}
            className={cx(
              'shrink-0 rounded-full p-2 ml-2',
              isResponding || (input.trim().length === 0 && !attachmentFile)
                ? 'text-muted-foreground bg-muted'
                : 'text-primary-foreground bg-primary hover:bg-primary/90'
            )}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
