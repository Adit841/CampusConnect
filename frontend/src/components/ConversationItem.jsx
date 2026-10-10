import { formatDistanceToNow } from '../util/dateUtils.js';

/**
 * A single row in the conversation list sidebar.
 */
export default function ConversationItem({ conversation, isActive, onClick, currentUserId, isOnline }) {
  const {
    otherParticipantDisplayName,
    otherParticipantUsername,
    lastMessageContent,
    lastMessageAt,
    lastMessageSenderId,
  } = conversation;

  const displayName = otherParticipantDisplayName || otherParticipantUsername || 'User';
  const isOwnLast = lastMessageSenderId != null && currentUserId != null && lastMessageSenderId === currentUserId;

  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150',
        'border-b border-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
        isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-500 dark:bg-slate-800/80' : 'bg-white border-l-4 border-l-transparent dark:bg-slate-900',
      ].join(' ')}
    >
      {/* Avatar with presence status dot */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm select-none">
          {displayName[0]?.toUpperCase() || '?'}
        </div>
        {isOnline && (
          <span
            className="absolute bottom-0 right-0 block size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
            title="Online"
          />
        )}
      </div>

      {/* Name + preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{displayName}</span>
          {lastMessageAt && (
            <span className="text-xs text-slate-400 shrink-0">{formatDistanceToNow(lastMessageAt)}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {lastMessageContent ? (
            <span>
              {isOwnLast && <span className="font-medium text-slate-600 dark:text-slate-300">You: </span>}
              {lastMessageContent}
            </span>
          ) : (
            <span className="italic text-slate-400">No messages yet</span>
          )}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
          {otherParticipantUsername?.includes('@') ? otherParticipantUsername : `@${otherParticipantUsername}`}
        </p>
      </div>
    </button>
  );
}
