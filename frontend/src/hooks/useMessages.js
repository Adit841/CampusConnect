import { useState, useEffect, useCallback } from 'react';
import { getMessages } from '../services/chatApi.js';

/**
 * Hook to fetch paginated message history for a conversation.
 *
 * @param {number|null} conversationId  Active conversation ID (null = no conversation selected).
 * @returns {{
 *   messages: Array,
 *   loading: boolean,
 *   error: string|null,
 *   hasMore: boolean,
 *   loadMore: function,
 *   appendMessage: function,
 *   confirmMessage: function
 * }}
 */
export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Reset when conversation changes
  useEffect(() => {
    setMessages([]);
    setPage(0);
    setHasMore(false);
    setError(null);
  }, [conversationId]);

  // Fetch initial page when conversationId changes
  useEffect(() => {
    if (conversationId == null || conversationId === 'undefined' || isNaN(Number(conversationId))) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMessages(conversationId, 0)
      .then((pageData) => {
        if (!cancelled) {
          setMessages(pageData.content);
          setHasMore(!pageData.last);
          setPage(1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.detail || err.message || 'Failed to load messages');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [conversationId]);

  /** Load the next page of history (older messages). */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || conversationId == null) return;
    setLoading(true);
    try {
      const pageData = await getMessages(conversationId, page);
      setMessages((prev) => [...pageData.content, ...prev]);
      setHasMore(!pageData.last);
      setPage((p) => p + 1);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load more messages');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, conversationId, page]);

  /**
   * Optimistically appends a message to the list (before server confirmation).
   * Uses a temporary id < 0 to distinguish it from server messages.
   */
  const appendMessage = useCallback((msg) => {
    setMessages((prev) => {
      // Dedup by clientMsgId or server id to prevent double delivery
      const exists = prev.find(
        (m) =>
          (msg.clientMsgId && m.clientMsgId === msg.clientMsgId) ||
          (msg.id && m.id > 0 && m.id === msg.id)
      );
      if (exists) return prev;
      return [...prev, msg];
    });
  }, []);

  /**
   * Replaces an optimistic message (negative tempId) with the confirmed server message.
   * Deduplication is by clientMsgId and server id.
   */
  const confirmMessage = useCallback((serverMsg) => {
    setMessages((prev) => {
      // If serverMsg already exists by exact server ID, do not duplicate
      const alreadySaved = prev.find((m) => serverMsg.id && m.id === serverMsg.id);
      if (alreadySaved) {
        return prev;
      }

      // If an optimistic message with matching clientMsgId exists, update it
      const matchIndex = prev.findIndex(
        (m) => serverMsg.clientMsgId && m.clientMsgId === serverMsg.clientMsgId
      );
      if (matchIndex !== -1) {
        const next = [...prev];
        next[matchIndex] = serverMsg;
        return next;
      }

      // Otherwise, append the newly confirmed message
      return [...prev, serverMsg];
    });
  }, []);

  const reload = useCallback(() => {
    if (conversationId == null) return;
    setError(null);
    getMessages(conversationId, 0)
      .then((pageData) => {
        setMessages((prev) => {
          const serverItems = pageData.content || [];
          const serverClientIds = new Set(serverItems.map((m) => m.clientMsgId).filter(Boolean));
          const serverIds = new Set(serverItems.map((m) => m.id).filter(Boolean));

          // Retain pending messages that have not yet been confirmed by the server
          const pending = prev.filter(
            (m) => m._sending && m.id < 0 && !serverClientIds.has(m.clientMsgId) && !serverIds.has(m.id)
          );
          return [...serverItems, ...pending];
        });
        setHasMore(!pageData.last);
        setPage(1);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message || 'Failed to reload messages');
      });
  }, [conversationId]);

  return { messages, loading, error, hasMore, loadMore, appendMessage, confirmMessage, reload };
}
