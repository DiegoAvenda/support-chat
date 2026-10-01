import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

/**
 * Article detail page. Fetches and displays a knowledge-base article by slug.
 */
export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    fetch(`/api/articles/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setArticle(data.article))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return (
    <div className="min-h-full bg-slate-50 p-4">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          to="/chat"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Volver al chat
        </Link>

        {isLoading && (
          <div className="mt-16 flex flex-col items-center gap-4 text-slate-500">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
            <p>Cargando artículo...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-4xl">😕</p>
            <p className="mt-2 font-semibold text-red-700">No se pudo cargar el artículo</p>
            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        )}

        {article && !isLoading && (
          <article className="animate-fade-in mt-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* AI Suggestion badge */}
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              <span>🤖</span>
              <span>Artículo sugerido por IA</span>
            </div>

            {/* Article title */}
            <h1 className="mb-2 text-2xl font-bold text-slate-900">
              {article.title || article.nombre || slug}
            </h1>

            {/* Slug pill */}
            <p className="mb-6 text-xs text-slate-400">
              <code className="rounded bg-slate-100 px-1.5 py-0.5">{slug}</code>
            </p>

            {/* Article content */}
            {article.content || article.contenido ? (
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                  {article.content || article.contenido}
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                <p className="font-medium">Vista previa del artículo</p>
                <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(article, null, 2)}</pre>
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
