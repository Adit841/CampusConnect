import { useState, useRef, useCallback } from 'react';

const MAX_LENGTH = 4000;

/**
 * Message composer with text area, character count, and send button.
 * Prevents empty sends and enforces max length.
 * Supports Shift+Enter for newlines and Enter to send.
 *
 * @param {{ onSend: function, disabled: boolean, placeholder?: string }} props
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
    <div className="border-t border-slate-200 bg-white px-4 py-3">
      <div className={[
        'flex items-end gap-2 rounded-xl border transition-all',
        disabled ? 'border-slate-200 bg-slate-50' : 'border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100',
      ].join(' ')}>
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
          className="flex-1 resize-none bg-transparent px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none min-h-[44px] max-h-36 overflow-y-auto leading-relaxed disabled:cursor-not-allowed"
          style={{ height: 'auto' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 144) + 'px';
          }}
        />

        {/* Character counter (only shows when approaching limit) */}
        {text.length > MAX_LENGTH * 0.9 && (
          <span className={`text-xs px-2 self-center shrink-0 ${text.length > MAX_LENGTH ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
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
            'shrink-0 m-1.5 w-9 h-9 rounded-lg flex items-center justify-center transition-all',
            canSend
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed',
          ].join(' ')}
        >
          {sending ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 -rotate-45 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-1 pl-1">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
