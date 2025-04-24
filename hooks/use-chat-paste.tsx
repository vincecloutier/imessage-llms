import { useCallback, RefObject, ClipboardEvent } from 'react';


export function usePaste(
  textareaRef: RefObject<HTMLTextAreaElement>,
  setInput: (value: ((prev: string) => string) | string) => void,
  handleFileAdded: (file: File) => void
) {
  return useCallback((event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    
    const imageItem = Array.from(items).find(
      item => item.kind === 'file' && item.type.startsWith('image/')
    );
    
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        event.preventDefault();
        handleFileAdded(file);
        return;
      }
    }
    
    if (event.target !== textareaRef.current) {
      const textItem = Array.from(items).find(
        item => item.kind === 'string' && item.type === 'text/plain'
      );
      
      if (textItem) {
        textItem.getAsString((text) => {
          setInput(prev => prev + text);
          textareaRef.current?.focus();
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
            }
          });
        });
      }
    }
  }, [handleFileAdded, setInput, textareaRef]);
}