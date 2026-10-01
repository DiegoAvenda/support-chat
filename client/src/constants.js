/**
 * Role configuration metadata.
 */
export const ROLES = {
  client: {
    id: 'client',
    label: 'Cliente',
    emoji: '👤',
    description: 'Busca ayuda o tiene una pregunta',
    color: 'blue',
    bgClass: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    badgeClass: 'bg-blue-100 text-blue-700',
    bubbleClass: 'bg-blue-500 text-white',
    bubbleWrapClass: 'items-end',
    nameClass: 'text-blue-600',
  },
  agent: {
    id: 'agent',
    label: 'Agente',
    emoji: '👨‍💼',
    description: 'Soporte humano que ayuda a los clientes',
    color: 'emerald',
    bgClass: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    bubbleClass: 'bg-white border border-slate-200 text-slate-800 shadow-sm',
    bubbleWrapClass: 'items-start',
    nameClass: 'text-emerald-600',
  },
};

export const MAX_MESSAGE_LENGTH = 500;
