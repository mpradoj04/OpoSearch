export type UserRole = "opositor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
