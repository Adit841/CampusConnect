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
    unreadCount = 0,
  } = conversation;

  const displayName = otherParticipantDisplayName || otherParticipantUsername || 'User';
  const isOwnLast = lastMessageSenderId != null && currentUserId != null && lastMessageSenderId === currentUserId;
  const hasUnread = !isActive && unreadCount > 0;

  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={[
        'w-full flex items-center gap-3 px-3.5 py-3 text-left transition-all duration-150 rounded-xl my-0.5',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        isActive
          ? 'bg-indigo-50/90 text-indigo-950 font-medium shadow-xs border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-100 dark:border-indigo-800/60'
          : 'bg-white hover:bg-slate-50 border border-transparent dark:bg-slate-900 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200',
      ].join(' ')}
    >
      {/* Avatar with presence status dot */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-xs select-none">
          {displayName[0]?.toUpperCase() || '?'}
        </div>
        {isOnline ? (
          <span
            className="absolute -bottom-0.5 -right-0.5 block size-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
            title="Online"
          />
        ) : (
          <span
            className="absolute -bottom-0.5 -right-0.5 block size-3 rounded-full bg-slate-300 ring-2 ring-white dark:ring-slate-900 dark:bg-slate-600"
            title="Offline"
          />
        )}
      </div>

      {/* Name + preview + unread badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <span className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
            {displayName}
          </span>
          {lastMessageAt && (
            <span className={`text-[11px] shrink-0 ${hasUnread ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {formatDistanceToNow(lastMessageAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-xs truncate ${hasUnread ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
            {lastMessageContent ? (
              <span>
                {isOwnLast && <span className="font-medium text-slate-600 dark:text-slate-300">You: </span>}
                {lastMessageContent}
              </span>
            ) : (
              <span className="italic text-slate-400 dark:text-slate-500">No messages yet</span>
            )}
          </p>

          {hasUnread && (
            <span className="shrink-0 flex items-center justify-center px-1.5 py-0.2 min-w-4.5 h-4.5 text-[10px] font-bold text-white bg-indigo-600 rounded-full shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
