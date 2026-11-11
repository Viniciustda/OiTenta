// Cliente HTTP do web (Etapa D): fetch nativo, token Bearer e erros no formato do filtro global do
// backend ({ statusCode, error, message, details? }, docs/4-contrato-api.md) convertidos em ApiError,
// os mesmos erros que os repositórios de exemplo lançam.
import { ApiError } from "./api-error";

/** Base do backend. Acesso literal para o Next.js embutir o valor no build. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/** Chave do token no localStorage. */
export const TOKEN_KEY = "bora.token";

const DEFAULT_MESSAGE = "Algo deu errado. Tenta de novo.";

export interface TokenStore {
  get(): string | null;
  set(token: string): void;
  clear(): void;
}

// Usa window.localStorage: no servidor (SSR) não há token, e o Node 25 expõe um localStorage global
// sem os métodos quando não recebe --localstorage-file.
const browserStorage = (): Storage | null => {
  try {
    const s = typeof window === "undefined" ? null : window.localStorage;
    return s && typeof s.getItem === "function" ? s : null;
  } catch {
    return null;
  }
};

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export class LocalStorageTokenStore implements TokenStore {
  constructor(private readonly storage: () => KeyValueStorage | null = browserStorage) {}
  get() {
    return this.storage()?.getItem(TOKEN_KEY) ?? null;
  }
  set(token: string) {
    this.storage()?.setItem(TOKEN_KEY, token);
  }
  clear() {
    this.storage()?.removeItem(TOKEN_KEY);
  }
}

/**
 * 401 em rota autenticada: manda para /entrar com recarga completa (o estado das telas some com o
 * token), sem deixar a página protegida no histórico. Fica fora do router porque o cliente HTTP não é React.
 */
export const redirectToLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== "/entrar") window.location.replace(`${window.location.origin}/entrar`);
};

export type Query = Record<string, string | null | undefined>;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  /** false nas rotas públicas (register, login, demo): sem Bearer e sem redirecionar no 401. */
  auth?: boolean;
}

export interface HttpClientOptions {
  baseUrl?: string;
  tokens?: TokenStore;
  onUnauthorized?: () => void;
}

interface ErrorBody {
  statusCode?: unknown;
  error?: unknown;
  message?: unknown;
  details?: unknown;
}

export class HttpClient {
  readonly tokens: TokenStore;
  private readonly baseUrl: string;
  private readonly onUnauthorized: () => void;

  constructor({ baseUrl = API_URL, tokens = new LocalStorageTokenStore(), onUnauthorized = redirectToLogin }: HttpClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.tokens = tokens;
    this.onUnauthorized = onUnauthorized;
  }

  get<T>(path: string, query?: Query, options: Omit<RequestOptions, "query" | "body"> = {}) {
    return this.request<T>("GET", path, { ...options, query });
  }

  post<T>(path: string, body?: unknown, options: Omit<RequestOptions, "body"> = {}) {
    return this.request<T>("POST", path, { ...options, body });
  }

  put<T>(path: string, body?: unknown, options: Omit<RequestOptions, "body"> = {}) {
    return this.request<T>("PUT", path, { ...options, body });
  }

  async request<T>(method: string, path: string, { query, body, auth = true }: RequestOptions = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(query ?? {}).forEach(([k, v]) => {
      if (v != null) url.searchParams.set(k, v);
    });
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = auth ? this.tokens.get() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url.toString(), { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await res.text();
    const data = parse(text);

    if (!res.ok) {
      if (res.status === 401 && auth) {
        this.tokens.clear();
        this.onUnauthorized();
      }
      throw toApiError(res, data);
    }
    return data as T;
  }
}

function parse(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function toApiError(res: Response, data: unknown): ApiError {
  const b: ErrorBody = data && typeof data === "object" ? (data as ErrorBody) : {};
  const status = typeof b.statusCode === "number" ? b.statusCode : res.status;
  const error = typeof b.error === "string" ? b.error : res.statusText || "Error";
  const message = typeof b.message === "string" && b.message ? b.message : DEFAULT_MESSAGE;
  const details = Array.isArray(b.details) ? b.details.map(String) : undefined;
  return new ApiError(status, error, message, details);
}
