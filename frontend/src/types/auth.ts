export type UserRole = 'STUDENT' | 'COMPANY';

export const USER_ROLES = {
  STUDENT: 'STUDENT' as const,
  COMPANY: 'COMPANY' as const
} as const;

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface SignUpRequest {
  name: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  name: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}
