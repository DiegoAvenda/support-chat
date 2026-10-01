import ConnectionBadge from './ConnectionBadge.jsx';

/**
 * Chat page header with connection status, current role badge, and a
 * "change role" button.
 *
 * @param {{
 *   role: string,
 *   roleConfig: object,
 *   connectionStatus: string,
 *   onChangeRole: () => void
 * }} props
 */
export default function ChatHeader({ role, roleConfig, connectionStatus, onChangeRole }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      {/* Left: title + connection status */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <span className="text-lg">💬</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800">Soporte en Vivo con IA</h1>
          <div className="mt-0.5">
            <ConnectionBadge status={connectionStatus} />
          </div>
        </div>
      </div>

      {/* Right: current role + switch button */}
      <div className="flex items-center gap-2">
        <span
          className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${roleConfig.badgeClass}`}
        >
          <span>{roleConfig.emoji}</span>
          <span>{roleConfig.label}</span>
        </span>
        <button
          onClick={onChangeRole}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 active:scale-95"
        >
          Cambiar rol
        </button>
      </div>
    </header>
  );
}
