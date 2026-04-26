import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav>
      {user && user.role === "admin" && (
        <div>
          <Link to="/admin/documentos">Documentos</Link>
          <Link to="/admin/indice">Índice</Link>
        </div>
      )}
      <button onClick={logout}>Cerrar sesión</button>
    </nav>
  );
}
