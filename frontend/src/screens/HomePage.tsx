import { useState, useEffect, useRef, useCallback } from "react";
import {
  searchDocuments,
  fetchTopics,
  type Force,
  type SortOption,
  type DocumentHit,
  type TopicItem,
} from "../services/SearchService";
import { ForceBadge } from "../components/ForceBadge";
import { TopicBadge } from "../components/TopicBadge";

const FORCE_LABELS: Record<string, string> = {
  policia_nacional: "Policía Nacional",
  guardia_civil: "Guardia Civil",
};
 
const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Más relevante",
  name_asc: "Nombre A–Z",
  name_desc: "Nombre Z–A",
};
 
const LIMIT = 10;

function Highlight({ html }: { html: string }) {
  return (
    <span
      className="excerpt"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [force, setForce] = useState<Force>("");
  const [topic, setTopic] = useState<number | "">("");
  const [sort, setSort] = useState<SortOption>("relevance");

  const [documents, setDocuments] = useState<DocumentHit[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
 
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTopicsLoading(true);
    setTopic("");
    fetchTopics(force || undefined)
      .then(setTopics)
      .catch(() => setTopics([]))
      .finally(() => setTopicsLoading(false));
  }, [force]);

  const doSearch = useCallback(
    async (overridePage = 1) => {
      if (!query && !force && !topic) return;
      setLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const result = await searchDocuments({
          q: query || undefined,
          force: force || undefined,
          topic: topic || undefined,
          page: overridePage,
          limit: LIMIT,
          sort,
        });
        setDocuments(result.documentos);
        setTotal(result.totalResultados);
        setTotalPages(result.totalPaginas);
        setPage(overridePage);
      } catch (e: any) {
        setError(e.message ?? "Error desconocido");
        setDocuments([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [query, force, topic, sort]
  );

  useEffect(() => {
    if (force || topic) doSearch(1);
  }, [force, topic, sort]);

  function handleSearch() {
    const q = inputValue.trim();
    setQuery(q);
  }

  useEffect(() => {
    if (query || force || topic) doSearch(1);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }
 
  function handleForceFilter(value: Force) {
    setForce(value);
    setHasSearched(true);
  }
 
  function handleTopicFilter(value: number | "") {
    setTopic(value);
    setHasSearched(true);
  }

  function getExcerpt(doc: DocumentHit): string {
    if (doc.highlights?.text?.length) return doc.highlights.text[0];
    if (doc.highlights?.name?.length) return doc.highlights.name[0];
    return "";
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
 
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
        body {
          font-family: 'Source Serif 4', Georgia, serif;
          background: #f7f6f2;
          color: #1a1a18;
          min-height: 100vh;
        }
 
        /* ─── hero ─── */
        .hero {
          background: #1a1a18;
          padding: 3rem 2.5rem 2.5rem;
          position: relative;
          overflow: hidden;
        }
 
        .hero::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 400px; height: 400px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .hero::after {
          content: '';
          position: absolute;
          top: 40px; right: 40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
          pointer-events: none;
        }
 
        .site-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.5rem;
        }
 
        .label-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #c0392b;
          flex-shrink: 0;
        }
 
        .label-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }
 
        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 0.5rem;
        }
 
        .hero-title em {
          font-style: italic;
          color: #c0392b;
        }
 
        .hero-sub {
          font-size: 15px;
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          margin-bottom: 2rem;
          line-height: 1.6;
          max-width: 520px;
        }
 
        /* ─── barra de búsqueda ─── */
        .search-wrap {
          position: relative;
          max-width: 640px;
        }
 
        .search-input {
          width: 100%;
          height: 54px;
          padding: 0 56px 0 20px;
          font-family: 'Source Serif 4', serif;
          font-size: 16px;
          font-weight: 300;
          font-style: italic;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 2px;
          color: #fff;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
 
        .search-input::placeholder { color: rgba(255,255,255,0.3); }
        .search-input:focus {
          border-color: #c0392b;
          background: rgba(255,255,255,0.1);
        }
 
        .search-btn {
          position: absolute;
          right: 0; top: 0;
          width: 54px; height: 54px;
          background: #c0392b;
          border: none;
          border-radius: 0 2px 2px 0;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
 
        .search-btn:hover { background: #922b21; }
 
        .search-btn svg {
          width: 18px; height: 18px;
          stroke: white;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
        }
 
        /* ─── stats strip ─── */
        .stats-strip {
          display: flex;
          gap: 0;
          background: #fff;
          border-bottom: 1px solid #e8e6e0;
        }
 
        .stat-item {
          padding: 0.9rem 2rem;
          border-right: 1px solid #e8e6e0;
          text-align: center;
        }
 
        .stat-item:last-child { border-right: none; }
 
        .stat-num {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #c0392b;
          line-height: 1;
        }
 
        .stat-lbl {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #888;
          display: block;
          margin-top: 2px;
        }
 
        /* ─── layout principal ─── */
        .body-section {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: calc(100vh - 260px);
        }
 
        /* ─── sidebar ─── */
        .sidebar {
          background: #fff;
          border-right: 1px solid #e8e6e0;
          padding: 2rem 1.5rem;
        }
 
        .filter-group { margin-bottom: 1.75rem; }
 
        .filter-group-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #aaa;
          display: block;
          margin-bottom: 0.6rem;
        }
 
        .filter-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 7px 10px;
          margin-bottom: 3px;
          border-radius: 2px;
          border: 1px solid transparent;
          background: transparent;
          font-family: 'Source Serif 4', serif;
          font-size: 13.5px;
          color: #333;
          cursor: pointer;
          text-align: left;
          transition: all 0.1s;
        }
 
        .filter-chip:hover { background: #f7f6f2; }
 
        .filter-chip.active {
          background: #fdf0f0;
          border-color: #c0392b;
          color: #c0392b;
        }
 
        .chip-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: -0.05em;
          flex-shrink: 0;
          color: white;
        }
 
        .chip-icon-pn { background: #003A72; }
        .chip-icon-gc { background: #1A5C1A; }
 
        .chip-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ccc;
          flex-shrink: 0;
          transition: background 0.1s;
        }
 
        .filter-chip.active .chip-dot { background: #c0392b; }
 
        .filter-chip .chip-num {
          font-size: 11px;
          color: #aaa;
          margin-left: auto;
          flex-shrink: 0;
        }
 
        .filter-chip.active .chip-num { color: #c0392b; }
 
        .divider { height: 1px; background: #e8e6e0; margin: 1.5rem 0; }
 
        .topics-loading {
          font-size: 12px;
          color: #aaa;
          font-style: italic;
          padding: 6px 10px;
        }
 
        /* ─── área de resultados ─── */
        .results-area { padding: 2rem; background: #f7f6f2; }
 
        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0ddd6;
        }
 
        .results-count {
          font-size: 13px;
          color: #888;
          font-style: italic;
        }
 
        .sort-select {
          font-family: 'Source Serif 4', serif;
          font-size: 13px;
          border: 1px solid #ddd;
          border-radius: 2px;
          padding: 5px 10px;
          background: #fff;
          color: #555;
          cursor: pointer;
        }
 
        /* ─── cards de documento ─── */
        .doc-card {
          display: flex;
          gap: 1.25rem;
          padding: 1.25rem;
          background: #fff;
          border: 1px solid #e8e6e0;
          border-radius: 2px;
          margin-bottom: 10px;
          transition: border-color 0.15s, box-shadow 0.15s;
          cursor: default;
        }
 
        .doc-card:hover {
          border-color: #c0392b;
          box-shadow: 0 2px 12px rgba(192,57,43,0.08);
        }
 
        .doc-index {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #ddd;
          line-height: 1;
          min-width: 30px;
          padding-top: 3px;
          user-select: none;
        }
 
        .doc-body { flex: 1; min-width: 0; }
 
        .doc-badges {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
 
        .badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 1px;
        }
 
        .badge-pn { background: #e8f0f9; color: #003A72; }
        .badge-gc { background: #e8f5e8; color: #1A5C1A; }
        .badge-topic { background: #f5f3ee; color: #888; border: 1px solid #e0ddd6; }
 
        .doc-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.35;
          margin-bottom: 6px;
          color: #1a1a18;
        }
 
        .excerpt {
          font-size: 13px;
          font-weight: 300;
          color: #666;
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
 
        .excerpt mark {
          background: #fde8e8;
          color: #c0392b;
          border-radius: 1px;
          padding: 0 2px;
          font-style: normal;
        }
 
        .doc-filepath {
          margin-top: 8px;
          font-size: 11px;
          color: #bbb;
          font-style: italic;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
 
        /* ─── paginación ─── */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 2rem;
          flex-wrap: wrap;
        }
 
        .page-btn {
          padding: 6px 14px;
          border: 1px solid #ddd;
          border-radius: 2px;
          background: #fff;
          font-family: 'Source Serif 4', serif;
          font-size: 13px;
          color: #555;
          cursor: pointer;
          transition: all 0.1s;
        }
 
        .page-btn:hover { border-color: #c0392b; color: #c0392b; }
 
        .page-btn.active {
          background: #c0392b;
          border-color: #c0392b;
          color: #fff;
        }
 
        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
 
        /* ─── estados vacíos ─── */
        .state-box {
          text-align: center;
          padding: 5rem 2rem;
        }
 
        .state-icon {
          font-size: 2.5rem;
          color: #ddd;
          margin-bottom: 1rem;
          line-height: 1;
        }
 
        .state-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #444;
          margin-bottom: 0.5rem;
        }
 
        .state-sub {
          font-size: 14px;
          color: #aaa;
          font-style: italic;
        }
 
        .loading-dots span {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #c0392b;
          margin: 0 3px;
          animation: bounce 1.2s infinite;
        }
 
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
 
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
 
        .error-box {
          background: #fdf0f0;
          border: 1px solid #f5c6c6;
          border-radius: 2px;
          padding: 1rem 1.25rem;
          margin-bottom: 1rem;
          font-size: 13px;
          color: #c0392b;
        }
      `}</style>

      {/* ─── HERO ─── */}
      <header className="hero">
        <h1 className="title">Oposearch</h1>
        <p className="subtitle">Fuerzas y Cuerpos de Seguridad del Estado</p>
        <p className="desc">
          Accede a la documentación oficial indexada para las oposiciones a
          Policía Nacional y Guardia Civil. Busca por texto libre, filtra por
          cuerpo o tema y localiza cualquier norma al instante.
        </p>

        {/* barra de búsqueda */}
        <div className="search-wrap">
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Busca un tema, ley, reglamento…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button className="search-btn" onClick={handleSearch} aria-label="Buscar">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div className="body-section">

        {/* ─── SIDEBAR ─── */}
        <aside className="sidebar">

            {/* Filtro por cuerpo */}
            <div className="filter-group">
            <span className="filter-group-label">Cuerpo</span>

            <button
              className={`chip ${force === "" ? "active" : ""}`}
              onClick={() => handleForceFilter("")}
            >
              <span className="chip-dot" />
              Todos los cuerpos
            </button>

            {(["policia_nacional", "guardia_civil"] as Force[]).map((f) => (
              <button
                key={f}
                className={`filter-chip ${force === f ? "active" : ""}`}
                onClick={() => handleForceFilter(f)}
              >
                <span
                  className={`chip-icon ${f === "policia_nacional" ? "chip-icon-pn" : "chip-icon-gc"}`}
                >
                  {f === "policia_nacional" ? "PN" : "GC"}
                </span>
                {FORCE_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="divider" />

          {/* Filtro por tema */}
          <div className="filter-group">
            <span className="filter-label">Tema</span>

            {topicsLoading ? (
              <p className="topics-loading">Cargando temas…</p>
            ) : (
              <>
                <button
                  className={`filter-chip ${topic === "" ? "active" : ""}`}
                  onClick={() => handleTopicFilter("")}
                >
                  <span className="chip-dot" />
                  Todos los temas
                </button>
 
                {topics.map((t) => (
                  <button
                    key={`${t.force}-${t.number}`}
                    className={`filter-chip ${topic === t.number ? "active" : ""}`}
                    onClick={() => handleTopicFilter(t.number)}
                    title={t.title}
                  >
                    <span className="chip-dot" />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.title}
                    </span>
                    <span className="chip-num">{t.number}</span>
                  </button>
                ))}

            {topics.length === 0 && (
                  <p className="topics-loading">Sin temas disponibles</p>
                )}
              </>
            )}
          </div>

        </aside>

        {/* ─── RESULTADOS ─── */}
        <main className="results-area">
          <div className="results-header">
            <span className="results-count">
              {!hasSearched
                ? "Introduce una búsqueda para empezar"
                : loading
                ? "Buscando…"
                : total !== null
                ? `${total.toLocaleString()} documento${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
                : ""}
            </span>
            
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* error */}
          {error && <div className="error-box">Error: {error}</div>}
 
          {/* loading */}
          {loading && (
            <div className="state-box">
              <div className="loading-dots">
                <span /><span /><span />
              </div>
            </div>
          )}

          {/* estado inicial */}
          {!hasSearched && !loading && (
            <div className="state-box">
              <div className="state-icon">⚖</div>
              <p className="state-title">Empieza tu búsqueda</p>
              <p className="state-sub">
                Escribe un término en el buscador o selecciona un cuerpo y un tema
                para explorar la documentación oficial.
              </p>
            </div>
          )}

          {/* sin resultados */}
          {hasSearched && !loading && !error && documents.length === 0 && (
            <div className="state-box">
              <div className="state-icon">◎</div>
              <p className="state-title">Sin resultados</p>
              <p className="state-sub">Prueba con otros términos o elimina algún filtro.</p>
            </div>
          )}

            {/* lista de documentos */}
            {!loading && documents.map((doc, i) => {
            const excerpt = getExcerpt(doc);
            const globalIndex = (page - 1) * LIMIT + i + 1;
 
            return (
              <article className="doc-card" key={doc.id}>
                <div className="doc-index">
                  {String(globalIndex).padStart(2, "0")}
                </div>
                <div className="doc-body">
                  <div className="doc-badges">
                    {doc.forces.map((f) => (
                      <ForceBadge key={f} force={f} />
                    ))}
                    {doc.topics.slice(0, 2).map((t) => (
                      <span key={`${t.force}-${t.number}`} className="badge badge-topic">
                        Tema {t.number}
                      </span>
                    ))}
                  </div>
 
                  {/* nombre: puede venir con <mark> del highlight */}
                  {doc.highlights?.name?.length ? (
                    <div
                      className="doc-name"
                      dangerouslySetInnerHTML={{ __html: doc.highlights.name[0] }}
                    />
                  ) : (
                    <div className="doc-name">{doc.name}</div>
                  )}
 
                  {excerpt && <Highlight html={excerpt} />}
 
                  {doc.filePath && (
                    <div className="doc-filepath">{doc.filePath}</div>
                  )}
                </div>
              </article>
            );
          })}
 
          {/* paginación */}
          {totalPages > 1 && !loading && (
            <nav className="pagination" aria-label="Paginación">
              <button
                className="page-btn"
                onClick={() => doSearch(page - 1)}
                disabled={page <= 1}
              >
                ← Anterior
              </button>
 
              {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
                const p = idx + 1;
                return (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? "active" : ""}`}
                    onClick={() => doSearch(p)}
                  >
                    {p}
                  </button>
                );
              })}
 
              {totalPages > 7 && page < totalPages && (
                <>
                  <span style={{ color: "#aaa" }}>…</span>
                  <button className="page-btn" onClick={() => doSearch(totalPages)}>
                    {totalPages}
                  </button>
                </>
              )}
 
              <button
                className="page-btn"
                onClick={() => doSearch(page + 1)}
                disabled={page >= totalPages}
              >
                Siguiente →
              </button>
            </nav>
          )}
        </main>
      </div>
    </>
  );
}