import { useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';
import MessageComposer from './MessageComposer.jsx';
import { useMessages } from '../hooks/useMessages.js';
import { useChat } from '../hooks/useChat.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatMessageDate } from '../util/dateUtils.js';

/**
 * Right-hand message pane — shows message history and composer for the selected conversation.
 */
export default function MessagePane({
  conversation,
  onMessageActivity,
  onPresenceEvent,
  otherParticipantPresence = 'OFFLINE',
  connected: propConnected,
  sendMessage: propSendMessage,
  wsError: propWsError,
  registerActiveMessageListener,
  registerReconnectListener,
}) {
  const { currentUser } = useAuth();
  const { messages, loading, error, hasMore, loadMore, appendMessage, confirmMessage, reload } = useMessages(
    conversation?.id ?? null
  );
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Handle incoming real-time messages for this active conversation
  const handleIncoming = useCallback((msg) => {
    if (conversation && msg.conversationId === conversation.id) {
      confirmMessage(msg);
      appendMessage(msg);
    }
  }, [conversation, appendMessage, confirmMessage]);

  useEffect(() => {
    if (registerActiveMessageListener) {
      return registerActiveMessageListener(handleIncoming);
    }
  }, [registerActiveMessageListener, handleIncoming]);

  useEffect(() => {
    if (registerReconnectListener) {
      return registerReconnectListener(reload);
    }
  }, [registerReconnectListener, reload]);

  // Fallback internal useChat only if props are not provided
  const fallbackChat = useChat(
    propSendMessage ? null : (conversation?.id ?? null),
    handleIncoming,
    onPresenceEvent,
    handleIncoming,
    reload
  );

  const connected = propConnected !== undefined ? propConnected : fallbackChat.connected;
  const sendMessage = propSendMessage || fallbackChat.sendMessage;
  const wsError = propWsError !== undefined ? propWsError : fallbackChat.wsError;

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
    onMessageActivity?.(conversation.id, content, optimistic.sentAt, currentUser?.id, true);

    try {
      const confirmed = await sendMessage(content, clientMsgId, conversation.id);
      if (confirmed) {
        // REST fallback returned a confirmed message
        confirmMessage(confirmed);
      }
      // WS path: server broadcasts back and confirms via handleIncoming
    } catch {
      confirmMessage({ ...optimistic, _sending: false, _failed: true });
    }
  }, [conversation, currentUser, appendMessage, confirmMessage, sendMessage, onMessageActivity]);

  const handleRetry = useCallback(async (failedMsg) => {
    if (!conversation) return;
    confirmMessage({ ...failedMsg, _sending: true, _failed: false });
    try {
      const confirmed = await sendMessage(failedMsg.content, failedMsg.clientMsgId, conversation.id);
      if (confirmed) {
        confirmMessage(confirmed);
      }
      onMessageActivity?.(conversation.id, failedMsg.content, failedMsg.sentAt, currentUser?.id, true);
    } catch {
      confirmMessage({ ...failedMsg, _sending: false, _failed: true });
    }
  }, [conversation, currentUser, sendMessage, confirmMessage, onMessageActivity]);

  // ── No conversation selected ──────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50/70 dark:bg-slate-900/40 gap-4 p-8">
        <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-indigo-500">
          <MessageSquare className="size-8" />
        </div>
        <div className="text-center max-w-xs">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">Select a conversation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Choose a contact from the sidebar or click "New" to start chatting with students and faculty.
          </p>
        </div>
      </div>
    );
  }

  // ── Group messages chronologically with date dividers ─────────────────────
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateStr = msg.sentAt ? new Date(msg.sentAt).toDateString() : null;
    if (dateStr && dateStr !== lastDate) {
      grouped.push({ type: 'divider', label: formatMessageDate(msg.sentAt), key: `div-${msg.sentAt}-${msg.id}` });
      lastDate = dateStr;
    }
    grouped.push({ type: 'message', msg, key: `msg-${msg.clientMsgId || msg.id}` });
  }

  const isOnline = otherParticipantPresence === 'ONLINE';

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/60">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative shrink-0">
          <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-xs select-none">
            {conversation.otherParticipantDisplayName?.[0]?.toUpperCase() || '?'}
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

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate leading-tight">
            {conversation.otherParticipantDisplayName || conversation.otherParticipantUsername}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {conversation.otherParticipantUsername?.includes('@')
              ? conversation.otherParticipantUsername
              : `@${conversation.otherParticipantUsername}`}
          </p>
        </div>

        {/* Real Participant Online Presence Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
          <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-500'}`} />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* WebSocket fallback warning */}
      {wsError && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{wsError} — messages will be sent via HTTP fallback.</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto py-4 flex flex-col">
        {/* Load more button */}
        {hasMore && (
          <div className="text-center mb-3">
            <button
              onClick={loadMore}
              disabled={loading}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-1"
            >
              {loading ? 'Loading earlier messages…' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && messages.length === 0 && (
          <div className="flex flex-col gap-3 px-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 ${i % 2 === 0 ? 'w-56' : 'w-44'}`} />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center px-4">
            <p className="text-xs text-rose-500 font-medium">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <RefreshCw className="size-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty messages state */}
        {!loading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-8">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No messages yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Send the first message to start the conversation!
            </p>
          </div>
        )}

        {/* Message bubbles with Day Dividers */}
        {grouped.map((item) =>
          item.type === 'divider' ? (
            <div key={item.key} className="text-center my-4">
              <span className="text-[11px] font-semibold text-slate-500 bg-white dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 rounded-full px-3.5 py-1 shadow-2xs">
                {item.label}
              </span>
            </div>
          ) : (
            <MessageBubble
              key={item.key}
              message={item.msg}
              onRetry={handleRetry}
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
        placeholder={`Message ${conversation.otherParticipantDisplayName || 'user'}…`}
      />
    </div>
  );
}
