/**
 * A single message bubble in the chat pane.
 * Own messages align right with indigo background.
 * Other's messages align left with white background.
 */
export default function MessageBubble({ message, isOwn }) {
  const time = message.sentAt
    ? new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
      {/* Other-user avatar */}
      {!isOwn && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-semibold mr-2 mt-1 select-none">
          {message.senderDisplayName?.[0]?.toUpperCase() || '?'}
        </div>
      )}

      <div className={`max-w-[72%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {/* Sender name (only for other's messages) */}
        {!isOwn && (
          <span className="text-[11px] text-slate-500 font-medium px-1">
            {message.senderDisplayName || message.senderUsername}
          </span>
        )}

        {/* Bubble */}
        <div
          className={[
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm',
            // Sending state
            message._sending ? 'opacity-60' : '',
            message._failed ? 'border-red-400 bg-red-50 text-red-700' : '',
          ].join(' ')}
        >
          {message.content}
        </div>

        {/* Timestamp + status */}
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] text-slate-400">{time}</span>
          {isOwn && message._sending && (
            <span className="text-[10px] text-slate-400">Sending…</span>
          )}
          {isOwn && message._failed && (
            <span className="text-[10px] text-red-500 font-medium">Failed</span>
          )}
          {isOwn && !message._sending && !message._failed && message.id > 0 && (
            <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
