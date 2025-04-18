'use client';

import { Message } from 'ai';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

import { PreviewAttachment } from './preview-attachment';

export const PreviewMessage = ({
  personaId,
  message,
  isLoading,
}: {
  personaId: string;
  message: Message;
  isLoading: boolean;
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          'flex gap-4 px-3 py-2 rounded-xl w-fit max-w-[85%]',
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

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
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
