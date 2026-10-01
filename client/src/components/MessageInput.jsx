import { useRef, useEffect } from 'react';
import { MAX_MESSAGE_LENGTH } from '../constants.js';

/**
 * Message input area with textarea, character counter, and send button.
 *
 * @param {{
 *   value: string,
 *   onChange: (v: string) => void,
 *   onSend: () => void,
 *   onKeyDown: (e: KeyboardEvent) => void,
 *   isSending: boolean,
 *   maxLength: number,
 *   roleConfig: object,
 *   connectionStatus: string
 * }} props
 */
export default function MessageInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  isSending,
  maxLength = MAX_MESSAGE_LENGTH,
  roleConfig,
  connectionStatus,
}) {
  const textareaRef = useRef(null);
  const charsLeft = maxLength - value.length;
  const isOverLimit = charsLeft < 0;
  const isDisabled = isSending || connectionStatus === 'disconnected' || isOverLimit;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [value]);

  const sendButtonColors =
    roleConfig.id === 'agent'
      ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200'
      : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200';

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3">
      <div className="mx-auto max-w-2xl">
        {/* Role hint for agents */}
        {roleConfig.id === 'agent' && (
          <p className="mb-2 text-[11px] text-slate-400">
            💡 Usa{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-500">just to confirm</code>{' '}
            o{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-500">
              let me confirm if i understood correctly
            </code>{' '}
            para activar la búsqueda por IA.
          </p>
        )}

        <div className="flex items-end gap-2">
          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                connectionStatus === 'disconnected'
                  ? 'Reconectando...'
                  : `Escribe un mensaje como ${roleConfig.label}...`
              }
              disabled={connectionStatus === 'disconnected'}
              rows={1}
              className={`w-full resize-none rounded-xl border px-4 py-3 pr-16 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-indigo-400 ${
                isOverLimit
                  ? 'border-red-300 bg-red-50 focus:ring-red-300'
                  : 'border-slate-300 bg-slate-50 hover:border-slate-400'
              }`}
              aria-label="Escribe tu mensaje"
            />
            {/* Char counter */}
            <span
              className={`pointer-events-none absolute bottom-3 right-3 text-[10px] font-medium ${
                isOverLimit
                  ? 'text-red-500'
                  : charsLeft <= 50
                    ? 'text-amber-500'
                    : 'text-slate-400'
              }`}
            >
              {charsLeft}
            </span>
          </div>

          {/* Send button */}
          <button
            onClick={onSend}
            disabled={isDisabled || !value.trim()}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white transition active:scale-95 disabled:cursor-not-allowed ${sendButtonColors}`}
            aria-label="Enviar mensaje"
          >
            {isSending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 translate-x-0.5 -translate-y-0.5 rotate-0"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>

        {/* Helper text */}
        <p className="mt-1.5 text-[11px] text-slate-400">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
