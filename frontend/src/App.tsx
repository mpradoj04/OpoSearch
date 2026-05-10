import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SideBar } from "./components/nav-bar/side-bar";
import { AdminPage } from "./screens/AdminPage";
import { HomePage } from "./screens/HomePage";
import { Login } from "./screens/LoginPage";
import { Register } from "./screens/RegisterPage";
import { SearchPage } from "./screens/SearchPage";
import { ThemeProvider } from "./context/ThemeContext";
import { DocumentPage } from "./screens/DocumentPage";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isPublic = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!isPublic && <SideBar />}
      <main style={{ marginLeft: isPublic ? "0" : "64px" }}>
        {children}
      </main>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Opositor */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute role="opositor">
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute role="opositor">
                    <SearchPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/document/:id"
                element={
                  <ProtectedRoute role="opositor">
                    <DocumentPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
