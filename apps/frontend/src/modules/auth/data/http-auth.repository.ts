import type { HttpClient } from "@/modules/core/data/http-client";
import type { AuthRepository } from "./auth.repository";
import type { LoginInput, LoginResponse, MeResponse, RegisterInput, RegisterResponse } from "./auth.types";

// /auth/* no backend real (docs/4-contrato-api.md §1). Login e demo guardam o token.
export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    return this.keep(await this.http.post<LoginResponse>("/auth/login", input, { auth: false }));
  }

  register(input: RegisterInput): Promise<RegisterResponse> {
    return this.http.post<RegisterResponse>("/auth/register", input, { auth: false });
  }

  async demo(): Promise<LoginResponse> {
    return this.keep(await this.http.post<LoginResponse>("/auth/demo", undefined, { auth: false }));
  }

  me(): Promise<MeResponse> {
    return this.http.get<MeResponse>("/auth/me");
  }

  async logout(): Promise<void> {
    this.http.tokens.clear();
  }

  private keep(res: LoginResponse) {
    this.http.tokens.set(res.token);
    return res;
  }
}
