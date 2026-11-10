// Tipos de docs/4-contrato-api.md §1 (Auth).
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}
