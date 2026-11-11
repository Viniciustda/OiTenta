import type { LoginInput, LoginResponse, MeResponse, RegisterInput, RegisterResponse } from "./auth.types";

// Fronteira das telas com /auth/*. Etapa B: dados de exemplo; Etapa D: HTTP.
export interface AuthRepository {
  login(input: LoginInput): Promise<LoginResponse>;
  register(input: RegisterInput): Promise<RegisterResponse>;
  demo(): Promise<LoginResponse>;
  me(): Promise<MeResponse>;
  /** Encerra a sessão neste dispositivo (W26 "Sair"). O contrato não tem rota de logout: o JWT só é descartado. */
  logout(): Promise<void>;
}
