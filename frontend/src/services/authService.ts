import { apiClient } from "../api/client";
import type { User } from "../types";

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  user: User;
}

interface RefreshResponse {
  message: string;
  accessToken: string;
}

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/users/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<RegisterResponse>("/users/register", {
      name,
      email,
      password,
    }),

  refreshToken: (token: string) =>
    apiClient.post<RefreshResponse>("/users/refresh-token", { token }),
};
