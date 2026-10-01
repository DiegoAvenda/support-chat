import { useEffect, useRef, useState, useCallback } from 'react';

const SSE_URL = '/api/chat/stream';

/**
 * Connection states for the SSE connection.
 * @typedef {'connecting' | 'connected' | 'disconnected'} ConnectionStatus
 */

/**
 * Custom hook that manages an SSE connection to the backend.
 * Handles automatic reconnection and message queuing.
 *
 * @returns {{
 *   messages: object[],
 *   connectionStatus: ConnectionStatus,
 *   clearMessages: () => void
 * }}
 */
export function useSSE() {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');
    const es = new EventSource(SSE_URL);
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      if (mountedRef.current) {
        setConnectionStatus('connected');
        console.log('✅ SSE connected');
      }
    });

    es.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      } catch (err) {
        console.warn('Failed to parse SSE message:', err);
      }
    };

    es.onerror = () => {
      if (!mountedRef.current) return;
      console.warn('⚠️  SSE connection error, will reconnect...');
      setConnectionStatus('disconnected');
      es.close();

      // The browser's native SSE will attempt to reconnect based on the
      // `retry` directive sent by the server (3000ms). We mirror that here.
      reconnectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, 3000);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      eventSourceRef.current?.close();
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, connectionStatus, clearMessages };
}
