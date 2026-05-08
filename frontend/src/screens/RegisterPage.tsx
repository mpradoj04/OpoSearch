import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/login");
    } catch (err) {
      setError("Error al registrarse. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    height: "48px",
    padding: "0 16px",
    fontFamily: "var(--sans)",
    fontSize: "15px",
    fontStyle: "italic",
    background: "var(--navy-mid)",
    border: "1px solid var(--border)",
    borderRadius: "2px",
    color: "var(--text-h)",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100svh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "2rem",
      boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* escudo + título */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <img
            src="/LogoCBD_sinfondo.png"
            alt="Oposearch"
            style={{ width: "60px", height: "60px", objectFit: "contain", margin: "0 auto 16px", display: "block" }}
          />
          <h1 style={{
            fontFamily: "var(--heading)",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
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
            fontSize: "11px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: 0,
          }}>
            Crea tu cuenta
          </p>
        </div>

        {/* card del formulario */}
        <div style={{
          background: "var(--navy-surface)",
          border: "1px solid var(--border)",
          borderRadius: "3px",
          padding: "2rem",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />

            {error && (
              <p style={{
                fontFamily: "var(--sans)",
                fontSize: "13px",
                color: "#e87c7c",
                background: "rgba(220,60,60,0.08)",
                border: "1px solid rgba(220,60,60,0.3)",
                borderRadius: "2px",
                padding: "8px 12px",
                margin: 0,
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                height: "48px",
                marginTop: "6px",
                fontFamily: "var(--heading)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                background: loading
                  ? "var(--gold-dark)"
                  : "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)",
                border: "none",
                borderRadius: "2px",
                color: "var(--navy-deep)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Registrando…" : "Registrarse"}
            </button>
          </form>

          {/* separador */}
          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--border), transparent)",
            margin: "1.5rem 0",
          }} />

          <p style={{
            fontFamily: "var(--sans)",
            fontSize: "14px",
            textAlign: "center",
            color: "var(--text-muted)",
            margin: 0,
          }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={{ color: "var(--gold)", textDecoration: "none" }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}