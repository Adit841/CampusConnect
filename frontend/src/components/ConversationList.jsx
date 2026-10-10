import { useState, useMemo } from 'react';
import ConversationItem from './ConversationItem.jsx';
import { Search, Plus, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { focusRing } from './ui/Card.jsx';

/**
 * Sidebar conversation list with search filter, loading skeletons, and polished empty states.
 */
export default function ConversationList({
  conversations,
  loading,
  error,
  activeId,
  onSelect,
  onRetry,
  onNewChat,
  currentUserId,
  presenceMap = {},
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!filterQuery.trim()) return conversations;
    const q = filterQuery.toLowerCase();
    return conversations.filter((c) => {
      const name = (c.otherParticipantDisplayName || '').toLowerCase();
      const username = (c.otherParticipantUsername || '').toLowerCase();
      const last = (c.lastMessageContent || '').toLowerCase();
      return name.includes(q) || username.includes(q) || last.includes(q);
    });
  }, [conversations, filterQuery]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
    [conversations]
  );

  return (
    <aside
      className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
      aria-label="Conversations"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Messages</h2>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white shadow-xs">
              {totalUnread} new
            </span>
          )}
        </div>
        {onNewChat && (
          <button
            onClick={onNewChat}
            id="new-chat-header-btn"
            title="Start new conversation"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-xs ${focusRing}`}
          >
            <Plus className="size-3.5" />
            <span>New</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="px-3.5 pt-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search conversations..."
            className={`w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 ${focusRing}`}
          />
        </div>
      </div>

      {/* Conversation List Body */}
      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin" role="list">
        {loading && (
          <div className="flex flex-col gap-2 p-2" aria-label="Loading conversations">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center p-2 rounded-xl animate-pulse">
                <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/5" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
            <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
              <AlertCircle className="size-5" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
            <button
              onClick={onRetry}
              className={`inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ${focusRing}`}
            >
              <RefreshCw className="size-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
            <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No conversations yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Start a direct conversation with classmates or faculty using the New button above.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && filteredConversations.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400">
            No chats matched "{filterQuery}".
          </div>
        )}

        {!loading && !error && filteredConversations.map((conv) => (
          <div key={conv.id} role="listitem">
            <ConversationItem
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv)}
              currentUserId={currentUserId}
              isOnline={presenceMap[conv.otherParticipantId] === 'ONLINE'}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
