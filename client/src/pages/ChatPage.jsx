import { useEffect, useRef, useState } from 'react';
import { useSSE } from '../hooks/useSSE.js';
import { useChat } from '../hooks/useChat.js';
import { ROLES, MAX_MESSAGE_LENGTH } from '../constants.js';
import ChatHeader from '../components/ChatHeader.jsx';
import MessageBubble from '../components/MessageBubble.jsx';
import ArticleSuggestion from '../components/ArticleSuggestion.jsx';
import MessageInput from '../components/MessageInput.jsx';

/**
 * Main chat page. Connects to SSE stream and allows sending messages.
 *
 * @param {{ role: 'client' | 'agent', onChangeRole: () => void }} props
 */
export default function ChatPage({ role, onChangeRole }) {
  const { messages, connectionStatus } = useSSE();
  const { sendMessage, isSending, sendError, clearError } = useChat(role);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const roleConfig = ROLES[role];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText('');
    clearError();
    try {
      await sendMessage(text);
    } catch {
      // Error is stored in sendError state
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <ChatHeader
        role={role}
        roleConfig={roleConfig}
        connectionStatus={connectionStatus}
        onChangeRole={onChangeRole}
      />

      {/* Messages panel */}
      <div className="messages-scroll flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <span className="mb-3 text-5xl">💬</span>
            <p className="font-medium">No hay mensajes aún.</p>
            <p className="mt-1 text-sm">Sé el primero en escribir algo.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-1">
            {messages.map((msg) => (
              <div key={msg.id}>
                <MessageBubble message={msg} currentRole={role} />
                {/* Article suggestion card (only visible on agent messages with a slug) */}
                {msg.searchResultSlug && (
                  <ArticleSuggestion
                    slug={msg.searchResultSlug}
                    className={msg.userRole === 'client' ? 'justify-end' : 'justify-start'}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Send error alert */}
      {sendError && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <span>⚠️</span>
          <span className="flex-1">{sendError}</span>
          <button
            onClick={clearError}
            className="ml-2 font-semibold hover:text-red-900"
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input area */}
      <MessageInput
        value={inputText}
        onChange={setInputText}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        isSending={isSending}
        maxLength={MAX_MESSAGE_LENGTH}
        roleConfig={roleConfig}
        connectionStatus={connectionStatus}
      />
    </div>
  );
}
