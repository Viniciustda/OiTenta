import { clone, ExampleBackend, exampleBackend, type ExampleUser } from "@/modules/core/data/example-backend";
import type { AuthRepository } from "./auth.repository";
import type { AuthUser, LoginInput, LoginResponse, MeResponse, RegisterInput, RegisterResponse } from "./auth.types";

const toUser = ({ id, name, email, timezone }: ExampleUser): AuthUser => clone({ id, name, email, timezone });
const tokenOf = (u: ExampleUser) => `example-token-${u.id}`;

// Dados de exemplo (Etapa B). Sem sessão, "me" devolve o usuário demo; o 401 real entra na Etapa D.
export class ExampleAuthRepository implements AuthRepository {
  constructor(private readonly backend: ExampleBackend = exampleBackend) {}

  async login({ email, password }: LoginInput): Promise<LoginResponse> {
    const u = this.backend.login(email, password);
    return { token: tokenOf(u), user: toUser(u) };
  }

  async register({ name, email, password, timezone }: RegisterInput): Promise<RegisterResponse> {
    return { user: toUser(this.backend.register(name, email, password, timezone)) };
  }

  async demo(): Promise<LoginResponse> {
    const u = this.backend.users[0];
    this.backend.sessionUserId = u.id;
    return { token: tokenOf(u), user: toUser(u) };
  }

  async me(): Promise<MeResponse> {
    return { user: toUser(this.backend.currentUser()) };
  }

  async logout(): Promise<void> {
    this.backend.sessionUserId = null;
  }
}
