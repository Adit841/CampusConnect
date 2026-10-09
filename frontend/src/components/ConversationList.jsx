import ConversationItem from './ConversationItem.jsx';

/**
 * Sidebar conversation list with loading, empty, and error states.
 */
export default function ConversationList({
  conversations,
  loading,
  error,
  activeId,
  onSelect,
  onRetry,
}) {
  return (
    <aside
      className="flex flex-col h-full bg-white border-r border-slate-200"
      aria-label="Conversations"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Messages</h2>
        <p className="text-xs text-slate-500 mt-0.5">Your conversations</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" role="list">
        {loading && (
          <div className="flex flex-col gap-3 p-4" aria-label="Loading conversations">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">{error}</p>
            <button
              onClick={onRetry}
              className="text-sm text-indigo-600 font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No conversations yet</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Start a conversation by searching for a classmate or teacher.
            </p>
          </div>
        )}

        {!loading && !error && conversations.map((conv) => (
          <div key={conv.id} role="listitem">
            <ConversationItem
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv)}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
