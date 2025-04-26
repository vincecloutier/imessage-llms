import { useCallback, useEffect, RefObject } from 'react';

export function useKeyboardFocus(textareaRef: RefObject<HTMLTextAreaElement>) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInputElement = ['INPUT', 'TEXTAREA', 'BUTTON'].includes(target.tagName) || target.isContentEditable;
    if (isInputElement) return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1 || event.isComposing) return;
    textareaRef.current?.focus();
  }, [textareaRef]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}