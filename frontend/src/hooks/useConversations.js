import { useState, useEffect, useCallback } from 'react';
import { getConversations, createConversation } from '../services/chatApi.js';
import { TOKEN_STORAGE_KEY } from '../services/api.js';

/**
 * Sorts conversations by latest activity timestamp descending (newest first).
 * Uses conversation ID as a deterministic tie-breaker for equal or null timestamps.
 */
export function sortConversations(convList) {
  if (!Array.isArray(convList)) return [];
  return [...convList].sort((a, b) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return (b.id || 0) - (a.id || 0);
  });
}

/**
 * Hook to fetch and manage the authenticated user's conversation list.
 *
 * @returns {{
 *   conversations: Array,
 *   loading: boolean,
 *   error: string|null,
 *   reload: function,
 *   startConversation: function,
 *   updateLastMessage: function,
 *   markAsRead: function
 * }}
 */
export function useConversations(currentUserId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setConversations([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      setConversations(sortConversations(data));
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to load conversations';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /**
   * Starts or opens a conversation with a target user.
   * Returns the conversation summary, or throws on error.
   */
  const startConversation = useCallback(async (targetUserId) => {
    const conv = await createConversation(targetUserId);
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === conv.id);
      const merged = exists
        ? prev.map((c) => (c.id === conv.id ? { ...c, ...conv } : c))
        : [conv, ...prev];
      return sortConversations(merged);
    });
    return conv;
  }, []);

  /**
   * Updates the last message preview, sender, and timestamp for a conversation,
   * bubbles it to the top, and increments unread count if not currently active.
   */
  const updateLastMessage = useCallback((conversationId, content, sentAt, senderId, isActive = false) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === conversationId);
      if (idx === -1) {
        // If not found, reload to get latest list from server
        load();
        return prev;
      }

      const target = prev[idx];
      const isFromOther = senderId != null && currentUserId != null && senderId !== currentUserId;
      const newUnread = isActive ? 0 : isFromOther ? (target.unreadCount || 0) + 1 : (target.unreadCount || 0);

      const updated = {
        ...target,
        lastMessageContent: content,
        lastMessageAt: sentAt || new Date().toISOString(),
        lastMessageSenderId: senderId !== undefined ? senderId : target.lastMessageSenderId,
        unreadCount: newUnread,
      };

      const others = prev.filter((c) => c.id !== conversationId);
      return sortConversations([updated, ...others]);
    });
  }, [currentUserId, load]);

  /**
   * Clears the unread count for an active conversation.
   */
  const markAsRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  return {
    conversations,
    loading,
    error,
    reload: load,
    startConversation,
    updateLastMessage,
    markAsRead,
  };
}
