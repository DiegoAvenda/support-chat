import { ROLES } from '../constants.js';

/**
 * Format an ISO timestamp to a localized time string (HH:mm).
 * @param {string} isoString
 * @returns {string}
 */
function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Individual chat message bubble.
 *
 * @param {{
 *   message: {
 *     id: string,
 *     text: string,
 *     userRole: 'client' | 'agent',
 *     createdAt: string,
 *     searchResultSlug: string | null
 *   },
 *   currentRole: 'client' | 'agent'
 * }} props
 */
export default function MessageBubble({ message, currentRole }) {
  const isMine = message.userRole === currentRole;
  const roleConfig = ROLES[message.userRole] ?? ROLES.client;
  const animationClass = isMine ? 'animate-slide-in-right' : 'animate-slide-in-left';

  return (
    <div
      className={`flex flex-col gap-1 py-1 ${animationClass} ${roleConfig.bubbleWrapClass}`}
    >
      {/* Role label */}
      <div
        className={`flex items-center gap-1.5 text-xs ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <span>{roleConfig.emoji}</span>
        <span className={`font-semibold ${roleConfig.nameClass}`}>{roleConfig.label}</span>
        {isMine && (
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
            Tú
          </span>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${roleConfig.bubbleClass} ${
            isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        </div>
      </div>

      {/* Timestamp */}
      <div className={`flex text-[10px] text-slate-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {formatTime(message.createdAt)}
      </div>
    </div>
  );
}
