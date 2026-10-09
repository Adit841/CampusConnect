import { useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageBubble from './MessageBubble.jsx';
import MessageComposer from './MessageComposer.jsx';
import { useMessages } from '../hooks/useMessages.js';
import { useChat } from '../hooks/useChat.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatMessageDate } from '../util/dateUtils.js';

/**
 * Right-hand message pane — shows history and the composer for the selected conversation.
 */
export default function MessagePane({ conversation }) {
  const { currentUser } = useAuth();
  const { messages, loading, error, hasMore, loadMore, appendMessage, confirmMessage } = useMessages(
    conversation?.id ?? null
  );
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Handle incoming real-time messages
  const handleIncoming = useCallback((msg) => {
    confirmMessage(msg);
    appendMessage(msg);
  }, [appendMessage, confirmMessage]);

  const { connected, sendMessage, wsError } = useChat(conversation?.id ?? null, handleIncoming);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(async (content) => {
    if (!conversation) return;
    const clientMsgId = uuidv4();

    // Optimistic message
    const optimistic = {
      id: -Date.now(),
      conversationId: conversation.id,
      senderId: currentUser?.id ?? -1,
      senderUsername: currentUser?.email || currentUser?.username || '',
      senderDisplayName: currentUser?.name || currentUser?.displayName || 'You',
      content,
      sentAt: new Date().toISOString(),
      clientMsgId,
      _sending: true,
    };
    appendMessage(optimistic);

    try {
      const confirmed = await sendMessage(content, clientMsgId);
      if (confirmed) {
        // REST fallback returned a confirmed message
        confirmMessage(confirmed);
      }
      // WS path: server will broadcast back and confirmMessage via handleIncoming
    } catch {
      // Mark as failed
      confirmMessage({ ...optimistic, _sending: false, _failed: true });
    }
  }, [conversation, currentUser, appendMessage, confirmMessage, sendMessage]);

  // ── No conversation selected ──────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 gap-4">
        <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center">
          <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700">Select a conversation</p>
          <p className="text-sm text-slate-500 mt-1">Choose from the list to start chatting</p>
        </div>
      </div>
    );
  }

  // ── Group messages by date ────────────────────────────────────────────────
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateStr = msg.sentAt ? new Date(msg.sentAt).toDateString() : null;
    if (dateStr && dateStr !== lastDate) {
      grouped.push({ type: 'divider', label: formatMessageDate(msg.sentAt), key: `div-${msg.sentAt}` });
      lastDate = dateStr;
    }
    grouped.push({ type: 'message', msg, key: `msg-${msg.clientMsgId || msg.id}` });
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 bg-white shadow-sm">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 select-none">
          {conversation.otherParticipantDisplayName?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm leading-tight">
            {conversation.otherParticipantDisplayName}
          </p>
          <p className="text-xs text-slate-500">@{conversation.otherParticipantUsername}</p>
        </div>

        {/* Connection status indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-300'} shrink-0`} />
          <span className="text-xs text-slate-400">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {/* WebSocket error banner */}
      {wsError && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-700 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          {wsError} — messages sent via HTTP.
        </div>
      )}

      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto py-4 flex flex-col">
        {/* Load more button */}
        {hasMore && (
          <div className="text-center mb-2">
            <button
              onClick={loadMore}
              disabled={loading}
              className="text-xs text-indigo-600 hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              {loading ? 'Loading…' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && messages.length === 0 && (
          <div className="flex flex-col gap-3 px-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`h-9 rounded-2xl bg-slate-200 ${i % 2 === 0 ? 'w-48' : 'w-40'}`} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-6 text-sm text-red-500">{error}</div>
        )}

        {/* Empty state */}
        {!loading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-8">
            <p className="text-sm font-medium text-slate-600">No messages yet</p>
            <p className="text-xs text-slate-400">Send the first message to get the conversation started!</p>
          </div>
        )}

        {/* Message bubbles */}
        {grouped.map((item) =>
          item.type === 'divider' ? (
            <div key={item.key} className="text-center my-3">
              <span className="text-[11px] text-slate-400 bg-slate-100 rounded-full px-3 py-0.5">
                {item.label}
              </span>
            </div>
          ) : (
            <MessageBubble
              key={item.key}
              message={item.msg}
              isOwn={
                (currentUser?.id != null && item.msg.senderId === currentUser.id) ||
                item.msg.senderUsername === currentUser?.username ||
                item.msg.senderUsername === currentUser?.email
              }
            />
          )
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <MessageComposer
        onSend={handleSend}
        disabled={false}
        placeholder={`Message ${conversation.otherParticipantDisplayName}…`}
      />
    </div>
  );
}
