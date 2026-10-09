import { formatDistanceToNow } from '../util/dateUtils.js';

/**
 * A single row in the conversation list sidebar.
 */
export default function ConversationItem({ conversation, isActive, onClick }) {
  const { otherParticipantDisplayName, otherParticipantUsername, lastMessageContent, lastMessageAt } = conversation;

  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150',
        'border-b border-slate-100 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
        isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'bg-white border-l-4 border-l-transparent',
      ].join(' ')}
    >
      {/* Avatar */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm select-none">
        {otherParticipantDisplayName?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Name + preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 text-sm truncate">{otherParticipantDisplayName}</span>
          {lastMessageAt && (
            <span className="text-xs text-slate-400 shrink-0">{formatDistanceToNow(lastMessageAt)}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {lastMessageContent || <span className="italic">No messages yet</span>}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{otherParticipantUsername?.includes('@') ? otherParticipantUsername : `@${otherParticipantUsername}`}</p>
      </div>
    </button>
  );
}
