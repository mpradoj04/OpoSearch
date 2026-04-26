import { useState } from "react";
import { ForceBadge } from "../components/ForceBadge";
import { TopicBadge } from "../components/TopicBadge";

type Force = "policia_nacional" | "guardia_civil" | "";
type SortOption = "relevance" | "name_asc" | "name_desc";

interface MockTopic {
  number: number;
  title: string;
  force: "policia_nacional" | "guardia_civil";
}
 
interface MockDoc {
  id: string;
  name: string;
  forces: string[];
  topics: { number: number; title: string; force: string }[];
  excerpt: string;
  filePath: string;
}

/* ─── datos de maqueta ─── */
const MOCK_TOPICS: MockTopic[] = [
  { number: 1, title: "La Constitución Española de 1978",       force: "policia_nacional" },
  { number: 2, title: "Derechos y libertades fundamentales",     force: "policia_nacional" },
  { number: 3, title: "El poder judicial. El Ministerio Fiscal", force: "policia_nacional" },
  { number: 4, title: "La organización territorial del Estado",  force: "policia_nacional" },
  { number: 1, title: "El Estado. Concepto y elementos",         force: "guardia_civil" },
  { number: 2, title: "La Corona. Funciones constitucionales",   force: "guardia_civil" },
  { number: 3, title: "Las Cortes Generales",                    force: "guardia_civil" },
];
 
const MOCK_DOCS: MockDoc[] = [
  {
    id: "1",
    name: "Ley Orgánica 9/2015 de Régimen de Personal de la Policía Nacional",
    forces: ["policia_nacional"],
    topics: [{ number: 4, title: "Organización territorial", force: "policia_nacional" }],
    excerpt:
      "Esta ley regula el régimen de personal del Cuerpo Nacional de Policía, incluyendo el acceso, la promoción interna y el régimen disciplinario de sus miembros en el ejercicio de sus funciones.",
    filePath: "/docs/pn/lo9-2015.pdf",
  },
  {
    id: "2",
    name: "Ley 29/2014 de Régimen del Personal de la Guardia Civil",
    forces: ["guardia_civil"],
    topics: [{ number: 2, title: "Estatuto del guardia civil", force: "guardia_civil" }],
    excerpt:
      "Establece el régimen jurídico del personal de la Guardia Civil, regulando la carrera militar, el estatuto del guardia civil y las situaciones administrativas derivadas de su condición.",
    filePath: "/docs/gc/ley29-2014.pdf",
  },
  {
    id: "3",
    name: "Constitución Española — Título I: De los derechos y deberes fundamentales",
    forces: ["policia_nacional", "guardia_civil"],
    topics: [
      { number: 1, title: "La Constitución Española de 1978", force: "policia_nacional" },
      { number: 1, title: "El Estado. Concepto y elementos",   force: "guardia_civil" },
    ],
    excerpt:
      "Los españoles son iguales ante la ley, sin que pueda prevalecer discriminación alguna por razón de nacimiento, raza, sexo, religión, opinión o cualquier otra condición o circunstancia personal o social.",
    filePath: "/docs/comun/constitucion-titulo1.pdf",
  },
  {
    id: "4",
    name: "Real Decreto 864/1994 — Reglamento de los Cuerpos de Seguridad",
    forces: ["policia_nacional"],
    topics: [{ number: 3, title: "El poder judicial", force: "policia_nacional" }],
    excerpt:
      "Aprueba el reglamento de los Cuerpos y Fuerzas de Seguridad en materia de actuación policial, uso proporcional de la fuerza, detención y custodia de detenidos.",
    filePath: "/docs/pn/rd864-1994.pdf",
  },
];

export function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [force, setForce] = useState<Force>("");
  const [topic, setTopic] = useState<number | "">("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [hasSearched, setHasSearched] = useState(false);

  const visibleTopics = force
    ? MOCK_TOPICS.filter((t) => t.force === force)
    : MOCK_TOPICS;

  function handleSearch() {
    if (inputValue.trim() || force || topic){
      setHasSearched(true);
    } 
  }

  function handleForceChange(val: Force) {
    setForce(val);
    setTopic("");
  }

  return (
    <>
      <style>{`
        /* ─── página ─── */
        .hp-page {
          width: 100%;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
        }
 
        /* ─── hero ─── */
        .hp-hero {
          padding: 64px 40px 56px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
 
        .hp-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-border), transparent);
        }
 
        .hp-eyebrow {
          font-family: var(--heading);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
 
        .hp-eyebrow::before,
        .hp-eyebrow::after {
          content: '';
          width: 32px;
          height: 1px;
          background: var(--gold-dark);
        }
 
        .hp-title {
          font-family: var(--heading);
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
          margin: 0 0 6px;
          background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 50%, var(--gold-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
 
        .hp-subtitle {
          font-family: var(--heading);
          font-size: clamp(13px, 2vw, 16px);
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 40px;
        }
 
        .hp-desc {
          font-family: var(--sans);
          font-size: 16px;
          color: var(--text);
          max-width: 520px;
          text-align: center;
          line-height: 1.7;
          margin-bottom: 44px;
        }
 
        /* ─── barra de búsqueda ─── */
        .hp-search-wrap {
          width: 100%;
          max-width: 680px;
          position: relative;
        }
 
        .hp-search-input {
          width: 100%;
          box-sizing: border-box;
          height: 58px;
          padding: 0 64px 0 24px;
          font-family: var(--sans);
          font-size: 17px;
          font-style: italic;
          background: var(--navy-surface);
          border: 1px solid var(--accent-border);
          border-radius: 3px;
          color: var(--text-h);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.02em;
        }
 
        .hp-search-input::placeholder {
          color: var(--text-muted);
          font-style: italic;
        }
 
        .hp-search-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1), var(--shadow);
        }
 
        .hp-search-btn {
          position: absolute;
          right: 0; top: 0;
          width: 58px; height: 58px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
          border: none;
          border-radius: 0 3px 3px 0;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s;
        }
 
        .hp-search-btn:hover { opacity: 0.88; }
 
        .hp-search-btn svg {
          width: 20px; height: 20px;
          stroke: var(--navy-deep);
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
        }
 
        /* ─── stats ─── */
        .hp-stats {
          display: flex;
          justify-content: center;
          gap: 0;
          margin-top: 40px;
          border: 1px solid var(--border);
          border-radius: 3px;
          overflow: hidden;
          background: var(--navy-surface);
        }
 
        .hp-stat {
          padding: 14px 32px;
          border-right: 1px solid var(--border);
          text-align: center;
        }
 
        .hp-stat:last-child { border-right: none; }
 
        .hp-stat-num {
          display: block;
          font-family: var(--heading);
          font-size: 22px;
          font-weight: 600;
          color: var(--gold);
          letter-spacing: 0.06em;
          line-height: 1;
        }
 
        .hp-stat-lbl {
          display: block;
          font-family: var(--heading);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 4px;
        }
 
        /* ─── layout principal ─── */
        .hp-body {
          display: grid;
          grid-template-columns: 260px 1fr;
          flex: 1;
          border-top: 1px solid var(--border);
          margin-top: 48px;
        }
 
        /* ─── sidebar ─── */
        .hp-sidebar {
          border-right: 1px solid var(--border);
          padding: 32px 24px;
          text-align: left;
          background: rgba(13,21,38,0.4);
        }
 
        .hp-filter-group { margin-bottom: 28px; }
 
        .hp-filter-label {
          font-family: var(--heading);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--gold-dark);
          display: block;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
 
        .hp-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          margin-bottom: 3px;
          border-radius: 2px;
          border: 1px solid transparent;
          background: transparent;
          font-family: var(--sans);
          font-size: 14px;
          color: var(--text);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          letter-spacing: 0.01em;
          line-height: 1.3;
        }
 
        .hp-chip:hover {
          background: var(--accent-bg);
          border-color: var(--accent-border);
          color: var(--gold-light);
        }
 
        .hp-chip.active {
          background: var(--accent-bg);
          border-color: var(--gold);
          color: var(--gold-light);
        }
 
        .hp-chip-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--text-muted);
          flex-shrink: 0;
          transition: background 0.15s;
        }
 
        .hp-chip.active .hp-chip-dot { background: var(--gold); }
 
        .hp-chip-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--heading);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.05em;
          flex-shrink: 0;
          color: white;
        }
 
        .hp-chip-icon-pn { background: #003a72; }
        .hp-chip-icon-gc { background: #1a5c1a; }
 
        .hp-chip-num {
          font-family: var(--heading);
          font-size: 10px;
          color: var(--text-muted);
          margin-left: auto;
          flex-shrink: 0;
          letter-spacing: 0.1em;
        }
 
        .hp-chip.active .hp-chip-num { color: var(--gold-dark); }
 
        .hp-chip-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
 
        .hp-divider {
          height: 1px;
          background: var(--border);
          margin: 20px 0;
        }
 
        /* ─── zona de resultados ─── */
        .hp-results {
          padding: 32px 40px;
          text-align: left;
        }
 
        .hp-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
 
        .hp-results-count {
          font-family: var(--sans);
          font-size: 14px;
          font-style: italic;
          color: var(--text-muted);
        }
 
        .hp-sort-select {
          font-family: var(--heading);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid var(--accent-border);
          border-radius: 2px;
          padding: 6px 12px;
          background: var(--navy-surface);
          color: var(--gold);
          cursor: pointer;
          outline: none;
        }
 
        .hp-sort-select:focus { border-color: var(--gold); }
 
        /* ─── tarjetas de documento ─── */
        .hp-doc-card {
          display: flex;
          gap: 20px;
          padding: 20px 24px;
          margin-bottom: 10px;
          background: var(--navy-surface);
          border: 1px solid var(--border);
          border-radius: 3px;
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: default;
        }
 
        .hp-doc-card:hover {
          border-color: var(--accent-border);
          box-shadow: var(--shadow);
        }
 
        .hp-doc-index {
          font-family: var(--heading);
          font-size: 28px;
          font-weight: 700;
          color: var(--border);
          line-height: 1;
          min-width: 36px;
          padding-top: 2px;
          user-select: none;
          letter-spacing: 0.04em;
        }
 
        .hp-doc-body { flex: 1; min-width: 0; }
 
        .hp-doc-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
 
        .hp-doc-name {
          font-family: var(--heading);
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.04em;
          line-height: 1.35;
          margin-bottom: 8px;
          color: var(--text-h);
        }
 
        .hp-doc-excerpt {
          font-family: var(--sans);
          font-size: 14px;
          color: var(--text);
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
 
        .hp-doc-filepath {
          margin-top: 10px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
 
        /* ─── estado vacío / inicial ─── */
        .hp-state-box {
          text-align: center;
          padding: 80px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
 
        .hp-state-ornament {
          font-family: var(--heading);
          font-size: 40px;
          color: var(--border);
          line-height: 1;
          letter-spacing: 0.2em;
          margin-bottom: 8px;
        }
 
        .hp-state-title {
          font-family: var(--heading);
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
 
        .hp-state-sub {
          font-family: var(--sans);
          font-size: 14px;
          font-style: italic;
          color: var(--text-muted);
          max-width: 360px;
        }
 
        /* ─── responsive ─── */
        @media (max-width: 768px) {
          .hp-hero { padding: 40px 20px 40px; }
          .hp-body { grid-template-columns: 1fr; }
          .hp-sidebar { border-right: none; border-bottom: 1px solid var(--border); }
          .hp-results { padding: 24px 20px; }
          .hp-stats { flex-wrap: wrap; }
        }
      `}</style>

      <div className="hp-page">

        {/* ─── HERO ─── */}
        <header className="hp-hero">
          <h1 className="hp-title">Oposearch</h1>
          <p className="hp-subtitle">Fuerzas y Cuerpos de Seguridad del Estado</p>
          <p className="hp-desc">
            Accede a la documentación oficial indexada para las oposiciones a
            Policía Nacional y Guardia Civil. Busca por texto libre, filtra por
            cuerpo o tema y localiza cualquier norma al instante.
          </p>

          {/* barra de búsqueda */}
          <div className="hp-search-wrap">
            <input
              className="hp-search-input"
              type="text"
              placeholder="Busca un tema, ley, reglamento…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              autoComplete="off"
            />
            <button className="hp-search-btn" onClick={handleSearch} aria-label="Buscar">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
          </div>
        </header>

        {/* ─── BODY ─── */}
        <div className="hp-body">

          {/* ─── SIDEBAR ─── */}
          <aside className="hp-sidebar">

              {/* Filtro por cuerpo */}
              <div className="hp-filter-group">
              <span className="hp-filter-label">Cuerpo</span>
 
              <button
                className={`hp-chip ${force === "" ? "active" : ""}`}
                onClick={() => handleForceChange("")}
              >
                <span className="hp-chip-dot" />
                Todos los cuerpos
              </button>
 
              <button
                className={`hp-chip ${force === "policia_nacional" ? "active" : ""}`}
                onClick={() => handleForceChange("policia_nacional")}
              >
                <span className="hp-chip-icon hp-chip-icon-pn">PN</span>
                Policía Nacional
              </button>
 
              <button
                className={`hp-chip ${force === "guardia_civil" ? "active" : ""}`}
                onClick={() => handleForceChange("guardia_civil")}
              >
                <span className="hp-chip-icon hp-chip-icon-gc">GC</span>
                Guardia Civil
              </button>
            </div>

            <div className="hp-divider" />

            {/* Filtro por tema */}
            <div className="hp-filter-group">
              <span className="hp-filter-label">Tema</span>
 
              <button
                className={`hp-chip ${topic === "" ? "active" : ""}`}
                onClick={() => setTopic("")}
              >
                <span className="hp-chip-dot" />
                Todos los temas
              </button>
 
              {visibleTopics.map((t) => (
                <button
                  key={`${t.force}-${t.number}`}
                  className={`hp-chip ${topic === t.number && force === t.force ? "active" : ""}`}
                  onClick={() => { setTopic(t.number); setForce(t.force); }}
                  title={t.title}
                >
                  <span className="hp-chip-dot" />
                  <span className="hp-chip-title">{t.title}</span>
                  <span className="hp-chip-num">{t.number}</span>
                </button>
              ))}
            </div>

          </aside>

          {/* ─── RESULTADOS ─── */}
          <main className="hp-results">
            <div className="hp-results-header">
              <span className="hp-results-count">
                {hasSearched
                  ? `${MOCK_DOCS.length} documentos encontrados`
                  : "Introduce una búsqueda para empezar"}
              </span>
              
              <select
                className="hp-sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
              >
                <option value="relevance">Más relevante</option>
                <option value="name_asc">Nombre A–Z</option>
                <option value="name_desc">Nombre Z–A</option>
              </select>
            </div>

            {/* estado inicial */}
            {!hasSearched && (
              <div className="hp-state-box">
                <div className="hp-state-ornament">⚖</div>
                <p className="hp-state-title">Empieza tu búsqueda</p>
                <p className="hp-state-sub">
                  Escribe un término en el buscador o selecciona un cuerpo y un tema
                  para explorar la documentación oficial.
                </p>
              </div>
            )}

             {/* lista de documentos mock */}
             {hasSearched && MOCK_DOCS.map((doc, i) => (
              <article className="hp-doc-card" key={doc.id}>
                <div className="hp-doc-index">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="hp-doc-body">
                  <div className="hp-doc-badges">
                    {doc.forces.map((f) => (
                      <ForceBadge key={f} force={f} />
                    ))}
                    {doc.topics.map((t) => (
                      <TopicBadge key={`${t.force}-${t.number}`} number={t.number} force={t.force} />
                    ))}
                  </div>
                  <div className="hp-doc-name">{doc.name}</div>
                  <p className="hp-doc-excerpt">{doc.excerpt}</p>
                  <div className="hp-doc-filepath">{doc.filePath}</div>
                </div>
              </article>
            ))}
          </main>

        </div>

      </div>


    </>
  );
}