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
    if (conversationId == null) return;
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
      // Dedup by clientMsgId to handle WS delivery after optimistic append
      const exists = prev.find((m) => m.clientMsgId === msg.clientMsgId);
      if (exists) return prev;
      return [...prev, msg];
    });
  }, []);

  /**
   * Replaces an optimistic message (negative tempId) with the confirmed server message.
   * Deduplication is by clientMsgId.
   */
  const confirmMessage = useCallback((serverMsg) => {
    setMessages((prev) => {
      const exists = prev.find((m) => m.id === serverMsg.id);
      if (exists) return prev; // already confirmed (e.g. arrived via WS)
      return prev.map((m) =>
        m.clientMsgId === serverMsg.clientMsgId ? serverMsg : m
      );
    });
  }, []);
  const reload = useCallback(() => {
    if (conversationId == null) return;
    setLoading(true);
    setError(null);
    getMessages(conversationId, 0)
      .then((pageData) => {
        setMessages(pageData.content);
        setHasMore(!pageData.last);
        setPage(1);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message || 'Failed to load messages');
      })
      .finally(() => setLoading(false));
  }, [conversationId]);

  return { messages, loading, error, hasMore, loadMore, appendMessage, confirmMessage, reload };
}
