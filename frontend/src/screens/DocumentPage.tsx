import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchDocument, type DocumentDetail } from "../services/SearchService";

/* ── helpers ── */

// Detecta si una línea es un título/cabecera del documento
function getLineType(line: string): "title" | "chapter" | "article" | "section" | "normal" {
  const t = line.trim();
  if (!t) return "normal";
  if (/^TÍTULO\s+[IVXLCDM]+/i.test(t) || /^TÍTULO\s+PRELIMINAR/i.test(t)) return "title";
  if (/^CAPÍTULO\s+[IVXLCDM]+/i.test(t)) return "chapter";
  if (/^Artículo\s+\d+/i.test(t) || /^Artículo\s+\d+\s+bis/i.test(t)) return "article";
  if (
    /^Disposición\s+(adicional|transitoria|derogatoria|final)/i.test(t) ||
    /^EXPOSICIÓN\s+DE\s+MOTIVOS/i.test(t) ||
    /^TEXTO\s+CONSOLIDADO/i.test(t) ||
    /^PREÁMBULO/i.test(t) ||
    /^ANEXO/i.test(t) ||
    /^ÍNDICE/i.test(t)
  ) return "section";
  return "normal";
}

// Línea que no termina en puntuación fuerte probablemente continúa en la siguiente
function isContinuation(line: string): boolean {
  if (!line) return false;
  if (getLineType(line) !== "normal") return false;
  return !/[.;:?!»)\d]$/.test(line.trim());
}

function renderLines(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      elements.push(<div key={key++} style={{ height: "0.75rem" }} />);
      i++;
      continue;
    }

    const type = getLineType(trimmed);

    if (type === "title") {
      elements.push(
        <h2 key={key++} style={{
          fontFamily: "var(--heading)",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--gold)",
          margin: "2.5rem 0 0.6rem",
          paddingBottom: "6px",
          borderBottom: "1px solid var(--accent-border)",
        }}>
          {trimmed}
        </h2>
      );
      i++;
    } else if (type === "chapter") {
      elements.push(
        <h3 key={key++} style={{
          fontFamily: "var(--heading)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--gold-dark)",
          margin: "2rem 0 0.5rem",
        }}>
          {trimmed}
        </h3>
      );
      i++;
    } else if (type === "article") {
      elements.push(
        <p key={key++} style={{
          fontFamily: "var(--heading)",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "var(--text-h)",
          margin: "1.5rem 0 0.4rem",
        }}>
          {trimmed}
        </p>
      );
      i++;
    } else if (type === "section") {
      elements.push(
        <p key={key++} style={{
          fontFamily: "var(--heading)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          margin: "1.75rem 0 0.5rem",
        }}>
          {trimmed}
        </p>
      );
      i++;
    } else {
      // Agrupa líneas normales que continúan la misma frase
      const parts: string[] = [trimmed];
      while (
        i + 1 < lines.length &&
        isContinuation(parts[parts.length - 1]) &&
        getLineType(lines[i + 1].trim()) === "normal" &&
        lines[i + 1].trim()
      ) {
        i++;
        parts.push(lines[i].trim());
      }
      elements.push(
        <p key={key++} style={{
          fontFamily: "var(--sans)",
          fontSize: "15px",
          color: "var(--text)",
          lineHeight: 1.8,
          margin: "0 0 0.8rem",
          textAlign: "justify",
        }}>
          {parts.join(" ")}
        </p>
      );
      i++;
    }
  }

  return elements;
}

/* ── componente ── */
export function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Recibimos el highlight query desde la navegación
  const searchQuery = (location.state as any)?.query ?? "";

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchDocument(id, searchQuery || undefined)
      .then(setDoc)
      .catch((e) => setError(e.message ?? "Error al cargar el documento"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* ── cabecera ── */}
      <header style={{
        background: "var(--navy-deep)",
        borderBottom: "1px solid var(--border)",
        padding: "1.5rem 2.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate(-1)}
          title="Volver"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "36px", height: "36px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            color: "var(--text-muted)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: "16px", height: "16px" }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ height: "20px", width: "280px", background: "var(--border)", borderRadius: "2px", opacity: 0.5 }} />
          ) : (
            <h1 style={{
              fontFamily: "var(--heading)",
              fontSize: "clamp(13px, 2vw, 16px)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--text-h)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {doc?.name ?? "Documento"}
            </h1>
          )}
          <p style={{
            fontFamily: "var(--heading)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold-dark)",
            margin: "4px 0 0",
          }}>
            Documentación Oficial · Oposearch
          </p>
        </div>
      </header>

      {/* ── cuerpo ── */}
      <main style={{ flex: 1, padding: "3rem 4rem" }}>
        <div style={{ width: "100%", maxWidth: "100%" }}>

          {/* loading */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "80px 0" }}>
              {[0, 200, 400].map((d) => (
                <span key={d} style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "var(--gold-dark)",
                  animation: `bounce 1.2s ${d}ms infinite`,
                }} />
              ))}
              <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
            </div>
          )}

          {/* error */}
          {error && (
            <div style={{
              fontFamily: "var(--sans)", fontSize: "14px",
              color: "#e87c7c", background: "rgba(220,60,60,0.08)",
              border: "1px solid rgba(220,60,60,0.3)",
              borderRadius: "2px", padding: "12px 16px",
            }}>
              Error: {error}
            </div>
          )}

          {/* contenido */}
          {doc && !loading && (
            <>
              {/* título grande */}
              <div style={{
                marginBottom: "2.5rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid var(--border)",
              }}>
                <h1 style={{
                  fontFamily: "var(--heading)",
                  fontSize: "clamp(18px, 3vw, 26px)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  lineHeight: 1.3,
                  color: "var(--text-h)",
                  margin: "0 0 1rem",
                }}>
                  {doc.name}
                </h1>


              </div>

              {/* texto del documento */}
              <div>{renderLines(doc.text)}</div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}