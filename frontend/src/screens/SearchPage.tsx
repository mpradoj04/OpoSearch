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
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function SearchPage() {
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

  const doSearch = useCallback(async (overridePage = 1) => {
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

  useEffect(() => {
    if (query) doSearch(1);
  }, [query]);

  function handleSearch() {
    setQuery(inputValue.trim());
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

  function pageNumbers(): number[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)               return [1, 2, 3, 4, 5, -1, totalPages];
    if (page >= totalPages - 3)  return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, -1, page - 1, page, page + 1, -1, totalPages];
  }

  /* ── estilos compartidos ── */
  const chipBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "7px 10px",
    marginBottom: "3px",
    borderRadius: "2px",
    border: "1px solid transparent",
    background: "transparent",
    fontFamily: "var(--sans)",
    fontSize: "13px",
    color: "var(--text)",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
  };

  const chipActive: React.CSSProperties = {
    ...chipBase,
    background: "var(--accent-bg)",
    border: "1px solid var(--gold)",
    color: "var(--gold-light)",
  };

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* ─── HERO ─── */}
      <header style={{
        padding: "3rem 2.5rem 2.5rem",
        background: "var(--navy-deep)",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid var(--border)",
      }}>
        {/* eyebrow */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginBottom: "1.5rem",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--gold)", flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontFamily: "var(--heading)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Portal de Documentación Oficial
          </span>
        </div>

        {/* título */}
        <h1 style={{
          fontFamily: "var(--heading)",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          lineHeight: 1,
          margin: "0 0 6px",
          background: "linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 50%, var(--gold-dark) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Oposearch
        </h1>

        <p style={{
          fontFamily: "var(--heading)",
          fontSize: "13px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          margin: "0 0 2rem",
        }}>
          Fuerzas y Cuerpos de Seguridad del Estado
        </p>

        {/* barra de búsqueda */}
        <div style={{ position: "relative", maxWidth: "640px" }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Busca un tema, ley, reglamento…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoComplete="off"
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: "54px",
              padding: "0 56px 0 20px",
              fontFamily: "var(--sans)",
              fontSize: "16px",
              fontStyle: "italic",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--accent-border)",
              borderRadius: "2px",
              color: "var(--text-h)",
              outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = "var(--gold)"}
            onBlur={e => e.target.style.borderColor = "var(--accent-border)"}
          />
          <button
            onClick={handleSearch}
            aria-label="Buscar"
            style={{
              position: "absolute", right: 0, top: 0,
              width: "54px", height: "54px",
              background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)",
              border: "none", borderRadius: "0 2px 2px 0",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy-deep)" strokeWidth="2.2" strokeLinecap="round" style={{ width: "18px", height: "18px" }}>
              <circle cx="11" cy="11" r="6" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", flex: 1 }}>

        {/* ─── SIDEBAR FILTROS ─── */}
        <aside style={{
          borderRight: "1px solid var(--border)",
          padding: "2rem 1.5rem",
          background: "var(--navy-surface)",
          textAlign: "left",
        }}>

          {/* Cuerpo */}
          <div style={{ marginBottom: "1.75rem" }}>
            <span style={{
              fontFamily: "var(--heading)", fontSize: "9px", fontWeight: 600,
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--gold-dark)", display: "block",
              marginBottom: "12px", paddingBottom: "8px",
              borderBottom: "1px solid var(--border)",
            }}>
              Cuerpo
            </span>

            <button style={force === "" ? chipActive : chipBase} onClick={() => handleForceFilter("")}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: force === "" ? "var(--gold)" : "var(--text-muted)", flexShrink: 0 }} />
              Todos los cuerpos
            </button>

            {(["policia_nacional", "guardia_civil"] as Force[]).map((f) => (
              <button key={f} style={force === f ? chipActive : chipBase} onClick={() => handleForceFilter(f)}>
                <span style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--heading)", fontSize: "8px", fontWeight: 700,
                  color: "white", flexShrink: 0,
                  background: f === "policia_nacional" ? "#003a72" : "#1a5c1a",
                }}>
                  {f === "policia_nacional" ? "PN" : "GC"}
                </span>
                {FORCE_LABELS[f]}
              </button>
            ))}
          </div>

          <div style={{ height: "1px", background: "var(--border)", margin: "0 0 1.75rem" }} />

          {/* Tema */}
          <div>
            <span style={{
              fontFamily: "var(--heading)", fontSize: "9px", fontWeight: 600,
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--gold-dark)", display: "block",
              marginBottom: "12px", paddingBottom: "8px",
              borderBottom: "1px solid var(--border)",
            }}>
              Tema
            </span>

            {topicsLoading ? (
              <p style={{ fontFamily: "var(--sans)", fontSize: "13px", fontStyle: "italic", color: "var(--text-muted)", padding: "6px 10px" }}>
                Cargando temas…
              </p>
            ) : (
              <>
                <button style={topic === "" ? chipActive : chipBase} onClick={() => handleTopicFilter("")}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: topic === "" ? "var(--gold)" : "var(--text-muted)", flexShrink: 0 }} />
                  Todos los temas
                </button>

                {topics.map((t) => (
                  <button
                    key={`${t.force}-${t.number}`}
                    style={topic === t.number ? chipActive : chipBase}
                    onClick={() => handleTopicFilter(t.number)}
                    title={t.title}
                  >
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: topic === t.number ? "var(--gold)" : "var(--text-muted)", flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.title}
                    </span>
                    <span style={{ fontFamily: "var(--heading)", fontSize: "10px", color: "var(--text-muted)", marginLeft: "auto", flexShrink: 0 }}>
                      {t.number}
                    </span>
                  </button>
                ))}

                {topics.length === 0 && (
                  <p style={{ fontFamily: "var(--sans)", fontSize: "13px", fontStyle: "italic", color: "var(--text-muted)", padding: "6px 10px" }}>
                    Sin temas disponibles
                  </p>
                )}
              </>
            )}
          </div>
        </aside>

        {/* ─── RESULTADOS ─── */}
        <main style={{ padding: "2rem", background: "var(--bg)" }}>

          {/* cabecera */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "1.5rem", paddingBottom: "1rem",
            borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: "14px", fontStyle: "italic", color: "var(--text-muted)" }}>
              {!hasSearched
                ? "Introduce una búsqueda para empezar"
                : loading
                ? "Buscando…"
                : total !== null
                ? `${total.toLocaleString("es-ES")} documento${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
                : ""}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              style={{
                fontFamily: "var(--heading)", fontSize: "11px", letterSpacing: "0.12em",
                textTransform: "uppercase", border: "1px solid var(--accent-border)",
                borderRadius: "2px", padding: "6px 12px",
                background: "var(--navy-surface)", color: "var(--gold)", cursor: "pointer",
              }}
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* error */}
          {error && (
            <div style={{
              fontFamily: "var(--sans)", fontSize: "13px", color: "#e87c7c",
              background: "rgba(220,60,60,0.08)", border: "1px solid rgba(220,60,60,0.3)",
              borderRadius: "2px", padding: "10px 14px", marginBottom: "1rem",
            }}>
              Error: {error}
            </div>
          )}

          {/* loading */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "60px 0" }}>
              {[0, 200, 400].map((delay) => (
                <span key={delay} style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "var(--gold-dark)",
                  animation: `bounce 1.2s ${delay}ms infinite`,
                }} />
              ))}
              <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }`}</style>
            </div>
          )}

          {/* estado inicial */}
          {!hasSearched && !loading && (
            <div style={{ textAlign: "center", padding: "80px 40px" }}>
              <div style={{ fontFamily: "var(--heading)", fontSize: "40px", color: "var(--border)", marginBottom: "12px" }}>⚖</div>
              <p style={{ fontFamily: "var(--heading)", fontSize: "18px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
                Empieza tu búsqueda
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "14px", fontStyle: "italic", color: "var(--text-muted)" }}>
                Escribe un término o selecciona un filtro para explorar la documentación oficial.
              </p>
            </div>
          )}

          {/* sin resultados */}
          {hasSearched && !loading && !error && documents.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 40px" }}>
              <div style={{ fontFamily: "var(--heading)", fontSize: "40px", color: "var(--border)", marginBottom: "12px" }}>◎</div>
              <p style={{ fontFamily: "var(--heading)", fontSize: "18px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
                Sin resultados
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "14px", fontStyle: "italic", color: "var(--text-muted)" }}>
                Prueba con otros términos o elimina algún filtro.
              </p>
            </div>
          )}

          {/* lista de documentos */}
          {!loading && documents.map((doc, i) => {
            const excerpt     = getExcerpt(doc);
            const globalIndex = (page - 1) * LIMIT + i + 1;

            return (
              <article key={doc.id} style={{
                display: "flex", gap: "20px",
                padding: "20px 24px", marginBottom: "10px",
                background: "var(--navy-surface)",
                border: "1px solid var(--border)", borderRadius: "3px",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-border)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{
                  fontFamily: "var(--heading)", fontSize: "28px", fontWeight: 700,
                  color: "var(--border)", lineHeight: 1, minWidth: "36px",
                  paddingTop: "2px", userSelect: "none",
                }}>
                  {String(globalIndex).padStart(2, "0")}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {doc.forces.map((f) => <ForceBadge key={f} force={f} />)}
                    {doc.topics.slice(0, 2).map((t) => (
                      <span key={`${t.force}-${t.number}`} style={{
                        fontFamily: "var(--heading)", fontSize: "9px", fontWeight: 500,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        padding: "3px 8px", borderRadius: "2px",
                        border: "1px solid var(--accent-border)",
                        background: "var(--accent-bg)", color: "var(--gold)",
                      }}>
                        T{t.number}
                      </span>
                    ))}
                  </div>

                  {doc.highlights?.name?.length ? (
                    <div
                      style={{ fontFamily: "var(--heading)", fontSize: "15px", fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.35, marginBottom: "8px", color: "var(--text-h)" }}
                      dangerouslySetInnerHTML={{ __html: doc.highlights.name[0] }}
                    />
                  ) : (
                    <div style={{ fontFamily: "var(--heading)", fontSize: "15px", fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.35, marginBottom: "8px", color: "var(--text-h)" }}>
                      {doc.name}
                    </div>
                  )}

                  {excerpt && (
                    <p style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--text)", lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      <Highlight html={excerpt} />
                    </p>
                  )}

                  {doc.filePath && (
                    <div style={{ marginTop: "10px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                      {doc.filePath}
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {/* paginación */}
          {totalPages > 1 && !loading && (
            <nav style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", marginTop: "2rem", flexWrap: "wrap" }}>
              <button
                onClick={() => doSearch(page - 1)}
                disabled={page <= 1}
                style={{
                  fontFamily: "var(--heading)", fontSize: "11px", letterSpacing: "0.1em",
                  padding: "7px 14px", border: "1px solid var(--border)", borderRadius: "2px",
                  background: "var(--navy-surface)", color: "var(--text)", cursor: "pointer",
                  opacity: page <= 1 ? 0.3 : 1,
                }}
              >
                ← Anterior
              </button>

              {pageNumbers().map((p, idx) =>
                p === -1 ? (
                  <span key={`e-${idx}`} style={{ color: "var(--text-muted)", padding: "0 4px" }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => doSearch(p)}
                    style={{
                      fontFamily: "var(--heading)", fontSize: "11px", letterSpacing: "0.1em",
                      padding: "7px 14px", borderRadius: "2px", cursor: "pointer",
                      border: p === page ? "1px solid var(--gold)" : "1px solid var(--border)",
                      background: p === page ? "var(--accent-bg)" : "var(--navy-surface)",
                      color: p === page ? "var(--gold)" : "var(--text)",
                    }}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => doSearch(page + 1)}
                disabled={page >= totalPages}
                style={{
                  fontFamily: "var(--heading)", fontSize: "11px", letterSpacing: "0.1em",
                  padding: "7px 14px", border: "1px solid var(--border)", borderRadius: "2px",
                  background: "var(--navy-surface)", color: "var(--text)", cursor: "pointer",
                  opacity: page >= totalPages ? 0.3 : 1,
                }}
              >
                Siguiente →
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}