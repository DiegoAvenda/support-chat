/**
 * Connection status indicator dot + label.
 *
 * @param {{ status: 'connecting' | 'connected' | 'disconnected' }} props
 */
export default function ConnectionBadge({ status }) {
  const config = {
    connecting: {
      dot: 'bg-yellow-400 animate-pulse',
      label: 'Conectando',
      text: 'text-yellow-700',
      bg: 'bg-yellow-50 border-yellow-200',
    },
    connected: {
      dot: 'bg-emerald-400',
      label: 'En vivo',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    disconnected: {
      dot: 'bg-red-400 animate-pulse-slow',
      label: 'Desconectado',
      text: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
    },
  };

  const c = config[status] ?? config.connecting;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text}`}
      role="status"
      aria-label={`Estado de conexión: ${c.label}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
