import { useState, useEffect, useCallback } from 'react';
import { getBatchPresence } from '../services/chatApi.js';

/**
 * Hook to manage real-time and queried user online presence state.
 *
 * @param {Array<number>} userIds List of user IDs to initialize presence for.
 * @returns {{
 *   presenceMap: Record<number, string>,
 *   handlePresenceEvent: function,
 *   getStatus: function,
 *   isOnline: function
 * }}
 */
export function usePresence(userIds = []) {
  const [presenceMap, setPresenceMap] = useState({});

  const serializedIds = JSON.stringify(
    Array.from(new Set(userIds.filter((id) => id != null && !isNaN(id)))).sort()
  );

  // Fetch initial presence in batch
  useEffect(() => {
    const ids = JSON.parse(serializedIds);
    if (ids.length === 0) return;

    let cancelled = false;
    getBatchPresence(ids)
      .then((data) => {
        if (!cancelled && data) {
          setPresenceMap((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Non-blocking: fail gracefully
      });

    return () => {
      cancelled = true;
    };
  }, [serializedIds]);

  const handlePresenceEvent = useCallback((event) => {
    if (event && event.userId != null) {
      setPresenceMap((prev) => ({
        ...prev,
        [event.userId]: event.status,
      }));
    }
  }, []);

  const getStatus = useCallback(
    (userId) => {
      if (userId == null) return 'UNKNOWN';
      return presenceMap[userId] || 'OFFLINE';
    },
    [presenceMap]
  );

  const isOnline = useCallback(
    (userId) => {
      return getStatus(userId) === 'ONLINE';
    },
    [getStatus]
  );

  return {
    presenceMap,
    handlePresenceEvent,
    getStatus,
    isOnline,
  };
}
