import { Link } from 'react-router-dom';

/**
 * Article suggestion card shown when the AI RAG pipeline returns a slug.
 *
 * @param {{ slug: string, className?: string }} props
 */
export default function ArticleSuggestion({ slug, className = '' }) {
  return (
    <div className={`flex py-2 ${className}`}>
      <div className="animate-fade-in max-w-[80%] rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 shadow-sm">
        {/* AI badge */}
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
            🤖
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-indigo-600">
            Sugerencia de IA
          </span>
        </div>

        {/* Description */}
        <p className="mb-3 text-sm text-slate-700">
          Encontré un artículo relevante en nuestra base de conocimiento:
        </p>

        {/* Slug pill */}
        <div className="mb-3 rounded-lg bg-white/70 px-3 py-1.5">
          <code className="text-xs font-mono text-indigo-700">{slug}</code>
        </div>

        {/* CTA */}
        <Link
          to={`/articles/${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-600 active:scale-95"
        >
          📖 Leer artículo
        </Link>
      </div>
    </div>
  );
}
