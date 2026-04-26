import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/Login.css";
import { Link } from "react-router-dom";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      alert("Error al iniciar sesión");
      console.error(err);
    }
  }

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>

        <p className="login-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
