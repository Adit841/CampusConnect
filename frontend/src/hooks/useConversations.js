import { useState, useEffect, useCallback } from 'react';
import { getConversations, createConversation } from '../services/chatApi.js';

/**
 * Hook to fetch and manage the authenticated user's conversation list.
 *
 * @returns {{
 *   conversations: Array,
 *   loading: boolean,
 *   error: string|null,
 *   reload: function,
 *   startConversation: function
 * }}
 */
export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load conversations';
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
      return exists ? prev : [conv, ...prev];
    });
    return conv;
  }, []);
  /**
   * Updates the last message preview and timestamp for a conversation,
   * bubbling it to the top of the conversation list.
   */
  const updateLastMessage = useCallback((conversationId, content, sentAt) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === conversationId);
      if (idx === -1) return prev;
      const target = prev[idx];
      const updated = {
        ...target,
        lastMessageContent: content,
        lastMessageAt: sentAt || new Date().toISOString(),
      };
      const rest = prev.filter((c) => c.id !== conversationId);
      return [updated, ...rest];
    });
  }, []);

  return { conversations, loading, error, reload: load, startConversation, updateLastMessage };
}
