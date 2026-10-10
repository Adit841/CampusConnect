import { formatMessageTime } from '../util/dateUtils.js';
import { Check, AlertCircle } from 'lucide-react';

/**
 * A single message bubble in the chat pane.
 * Own messages align right with vibrant indigo/violet styling and delivery indicators.
 * Partner messages align left with clean card styling.
 */
export default function MessageBubble({ message, isOwn, onRetry }) {
  const time = formatMessageTime(message.sentAt);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 px-4 sm:px-6`}>
      {/* Other-user avatar */}
      {!isOwn && (
        <div className="shrink-0 size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold mr-2.5 mt-0.5 shadow-xs select-none">
          {message.senderDisplayName?.[0]?.toUpperCase() || '?'}
        </div>
      )}

      <div className={`max-w-[76%] sm:max-w-[68%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Sender name for other's messages */}
        {!isOwn && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
            {message.senderDisplayName || message.senderUsername}
          </span>
        )}

        {/* Bubble */}
        <div
          className={[
            'px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs break-words whitespace-pre-wrap',
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-xs shadow-indigo-600/10'
              : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/80',
            // Sending & Failed state
            message._sending ? 'opacity-70' : '',
            message._failed ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : '',
          ].join(' ')}
        >
          {message.content}
        </div>

        {/* Timestamp + delivery status */}
        <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 dark:text-slate-500">
          <span>{time}</span>
          {isOwn && message._sending && (
            <span className="text-slate-400 italic">Sending…</span>
          )}
          {isOwn && message._failed && (
            <div className="flex items-center gap-1 text-rose-500 font-medium">
              <AlertCircle className="size-3" />
              <span>Failed</span>
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer ml-1"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          {isOwn && !message._sending && !message._failed && (
            <Check className="size-3 text-indigo-400 dark:text-indigo-300" strokeWidth={2.5} />
          )}
        </div>
      </div>
    </div>
  );
}
