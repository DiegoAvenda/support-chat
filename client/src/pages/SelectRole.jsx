import { ROLES } from '../constants.js';

/**
 * Role selection page. Displayed when no role is set.
 *
 * @param {{ onSelectRole: (role: 'client' | 'agent') => void }} props
 */
export default function SelectRole({ onSelectRole }) {
  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Title */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <span className="text-3xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Soporte en Vivo</h1>
          <p className="mt-1 text-slate-500">Powered by AI · RAG · SSE</p>
        </div>

        {/* Role Cards */}
        <p className="mb-4 text-center text-sm font-medium text-slate-600">
          ¿Cómo deseas ingresar al chat?
        </p>

        <div className="flex flex-col gap-4">
          {Object.values(ROLES).map((roleConfig) => (
            <button
              key={roleConfig.id}
              onClick={() => onSelectRole(roleConfig.id)}
              className={`flex cursor-pointer items-center gap-5 rounded-2xl border-2 p-5 transition-all duration-150 ${roleConfig.bgClass} group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`}
            >
              <span className="text-5xl transition-transform duration-150 group-hover:scale-110">
                {roleConfig.emoji}
              </span>
              <div className="text-left">
                <p className="text-lg font-semibold text-slate-800">{roleConfig.label}</p>
                <p className="text-sm text-slate-500">{roleConfig.description}</p>
              </div>
              <span className="ml-auto text-slate-400 transition-transform duration-150 group-hover:translate-x-1">
                →
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Puedes cambiar de rol en cualquier momento desde el chat.
        </p>
      </div>
    </div>
  );
}
