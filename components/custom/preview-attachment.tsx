import { Attachment } from 'ai';
import { Loader, X, Eye } from 'lucide-react';
import { useState } from 'react';

export const PreviewAttachment = ({
  attachment,
  onRemove,
  isUploading = false,
}: {
  attachment: Attachment;
  onRemove: (attachment: Attachment) => void;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(attachment);
  };

  const handlePreviewOpen = () => {
    if (contentType?.startsWith('image')) {
      setIsPreviewOpen(true);
    }
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-1 group relative">
        <button
          type="button"
          onClick={handlePreviewOpen}
          className="w-20 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center overflow-hidden focus:outline-none"
          aria-label={`Preview ${name ?? 'attachment'}`}
          disabled={isUploading}
        >
          {contentType ? (
            contentType.startsWith('image') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={name ?? 'An image attachment'}
                className="rounded-md size-full object-cover"
              />
            ) : (
              <div className="text-xs p-1 text-center text-muted-foreground">
                {name ?? 'File'}
              </div>
            )
          ) : (
            <div className="text-xs p-1 text-center text-muted-foreground">
              Invalid Type
            </div>
          )}

          {contentType?.startsWith('image') && !isUploading && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="text-white h-6 w-6" />
             </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin text-white">
                <Loader />
              </div>
            </div>
          )}
        </button>
        {!isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0 right-0 -mt-1 -mr-1 bg-background border border-destructive text-destructive rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-destructive hover:text-destructive-foreground"
            aria-label={`Remove ${name ?? 'attachment'}`}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {isPreviewOpen && contentType?.startsWith('image') && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handlePreviewClose}
        >
          <div
            className="relative max-w-4xl max-h-[80vh] bg-background p-2 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
             <button
               type="button"
               onClick={handlePreviewClose}
               className="absolute top-2 right-2 bg-background text-muted-foreground rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted"
               aria-label="Close preview"
             >
               <X className="h-5 w-5" />
             </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={name ?? 'Image preview'}
              className="block max-w-full max-h-[calc(80vh-2rem)]"
            />
          </div>
        </div>
      )}
    </>
  );
};
