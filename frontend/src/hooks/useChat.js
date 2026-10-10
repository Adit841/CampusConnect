import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { sendMessageRest } from '../services/chatApi.js';
import { useAuth } from '../context/AuthContext.jsx';
const defaultWsUrl = import.meta.env.DEV ? '/ws/sockjs' : 'http://localhost:8080/ws/sockjs';
const WS_URL = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;

/**
 * Hook that manages the STOMP WebSocket connection and real-time message delivery.
 *
 * @param {number|null}   conversationId  The currently selected conversation.
 * @param {function}      onMessage       Called with a MessageDto when a new message arrives.
 * @returns {{
 *   connected: boolean,
 *   sendMessage: function,
 *   wsError: string|null
 * }}
 */
export function useChat(conversationId, onMessage, onPresence, onUserMessage, onReconnect) {
  const { currentUser, token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [wsError, setWsError] = useState(null);
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const onPresenceRef = useRef(onPresence);
  const onUserMessageRef = useRef(onUserMessage);
  const onReconnectRef = useRef(onReconnect);
  const hasConnectedOnceRef = useRef(false);

  // Keep callback refs current without triggering reconnects
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onPresenceRef.current = onPresence; }, [onPresence]);
  useEffect(() => { onUserMessageRef.current = onUserMessage; }, [onUserMessage]);
  useEffect(() => { onReconnectRef.current = onReconnect; }, [onReconnect]);

  // ── Connect / disconnect lifecycle ────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.username && !currentUser?.email) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        setWsError(null);

        if (hasConnectedOnceRef.current) {
          // Reconnection occurred — trigger resync of missed messages & conversations
          onReconnectRef.current?.();
        }
        hasConnectedOnceRef.current = true;

        // Subscribe to server-sent error messages (validation/auth failures)
        client.subscribe('/user/queue/errors', (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            setWsError(payload.error || 'Server error');
          } catch {
            setWsError('Server error');
          }
        });

        // Subscribe to server-wide user online presence events
        client.subscribe('/topic/presence', (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            onPresenceRef.current?.(payload);
          } catch {
            // ignore
          }
        });

        // Subscribe to user-specific incoming message queue
        client.subscribe('/user/queue/messages', (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            onUserMessageRef.current?.(payload);
          } catch {
            // ignore
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        setWsError(frame.headers?.message || 'WebSocket error');
        setConnected(false);
      },
      onWebSocketError: () => {
        setWsError('WebSocket connection failed — retrying…');
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
      hasConnectedOnceRef.current = false;
    };
  }, [currentUser?.username, currentUser?.email, token]);

  // ── Subscribe / unsubscribe when conversation changes ─────────────────────
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !connected || conversationId == null) return;

    // Unsubscribe from the previous conversation
    subscriptionRef.current?.unsubscribe();

    subscriptionRef.current = client.subscribe(
      `/topic/conversations/${conversationId}`,
      (frame) => {
        try {
          const msg = JSON.parse(frame.body);
          onMessageRef.current?.(msg);
        } catch {
          // malformed frame — ignore
        }
      }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [connected, conversationId]);

  /**
   * Sends a message to the target or current conversation.
   *
   * Primary path: STOMP /app/chat.send
   * Fallback:     REST POST /api/conversations/{id}/messages (when WS is disconnected)
   *
   * @param {string} content
   * @param {string} clientMsgId  UUID (v4) generated by the caller.
   * @param {number|null} [targetConvId] Optional conversation ID override.
   * @returns {Promise<Object|null>}  Resolved MessageDto on REST fallback; null on WS send.
   */
  const sendMessage = useCallback(async (content, clientMsgId, targetConvId = null) => {
    const activeId = targetConvId ?? conversationId;
    if (activeId == null) return null;

    const client = clientRef.current;
    if (client?.connected) {
      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ conversationId: activeId, content, clientMsgId }),
      });
      return null; // real-time response arrives via subscription
    }

    // WebSocket unavailable — fall back to REST
    return sendMessageRest(activeId, content, clientMsgId);
  }, [conversationId]);

  return { connected, sendMessage, wsError };
}
