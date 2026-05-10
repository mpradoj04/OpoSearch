const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }

  const { accessToken } = await res.json();
  localStorage.setItem("accessToken", accessToken);
  return accessToken;
}


async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  // Si el token expiró, intentamos refrescar UNA sola vez
  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, options, false);
    }
    throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? "Request failed");
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => 
    request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};