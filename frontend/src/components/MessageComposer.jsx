import { useState, useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { focusRing } from './ui/Card.jsx';

const MAX_LENGTH = 4000;

/**
 * Message composer with auto-resizing text area, character counter, and send button.
 * Prevents empty sends, enforces max length, supports Shift+Enter for newlines and Enter to send.
 */
export default function MessageComposer({ onSend, disabled, placeholder = 'Type a message…' }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  const canSend = text.trim().length > 0 && text.length <= MAX_LENGTH && !disabled && !sending;

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || content.length > MAX_LENGTH) return;
    setSending(true);
    try {
      await onSend(content);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  }, [text, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div
        className={[
          'flex items-end gap-2 rounded-xl border transition-all p-1',
          disabled
            ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-850'
            : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/40',
        ].join(' ')}
      >
        <textarea
          ref={textareaRef}
          id="message-composer"
          aria-label="Message input"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder={placeholder}
          maxLength={MAX_LENGTH + 1}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none min-h-[40px] max-h-32 overflow-y-auto leading-relaxed disabled:cursor-not-allowed"
          style={{ height: 'auto' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
          }}
        />

        {/* Character counter (shows when approaching limit) */}
        {text.length > MAX_LENGTH * 0.9 && (
          <span className={`text-[11px] px-2 self-center shrink-0 ${text.length > MAX_LENGTH ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
            {MAX_LENGTH - text.length}
          </span>
        )}

        {/* Send button */}
        <button
          id="send-message-btn"
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={[
            'shrink-0 size-9 rounded-lg flex items-center justify-center transition-all shadow-xs',
            focusRing,
            canSend
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed',
          ].join(' ')}
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4 -translate-y-px translate-x-px" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 px-1">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px]">Shift+Enter</kbd> for new line</span>
      </div>
    </div>
  );
}
