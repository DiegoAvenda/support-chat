import { useState, useCallback } from 'react';

const API_URL = '/api/chat';

/**
 * Custom hook for sending chat messages to the backend.
 *
 * @param {string} role - 'client' | 'agent'
 * @returns {{
 *   sendMessage: (text: string) => Promise<void>,
 *   isSending: boolean,
 *   sendError: string | null,
 *   clearError: () => void
 * }}
 */
export function useChat(role) {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim()) return;

      setIsSending(true);
      setSendError(null);

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim(), userRole: role }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${response.status}`);
        }
      } catch (err) {
        setSendError(err.message || 'Error al enviar el mensaje.');
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [role],
  );

  const clearError = useCallback(() => setSendError(null), []);

  return { sendMessage, isSending, sendError, clearError };
}
