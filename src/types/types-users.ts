import type { Roles, AuthProvider } from "@prisma/client";

export type UsersProps = {
  id: string;
  email: string;
  name: string;
  password: string | null;
  role: Roles;
  authProvider: AuthProvider;
  providerId: string | null;
  avatar: string | null;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  permissions: {};
  createdAt: Date;
  updatedAt: Date;
};

