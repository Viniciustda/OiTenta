// Apoio dos testes dos repositórios HTTP: fetch simulado com respostas em fila e leitura das chamadas.
import { vi } from "vitest";
import type { TokenStore } from "./http-client";

export interface FakeResponse {
  status: number;
  body?: unknown;
}

export function stubFetch(...responses: FakeResponse[]) {
  const queue = [...responses];
  const fn = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => {
    const next = queue.shift() ?? { status: 200, body: {} };
    const text = next.body === undefined ? "" : typeof next.body === "string" ? next.body : JSON.stringify(next.body);
    return new Response(text || null, { status: next.status, headers: { "Content-Type": "application/json" } });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

export function callOf(fn: ReturnType<typeof stubFetch>, index = 0) {
  const [url, init = {}] = fn.mock.calls[index];
  const headers = new Headers(init.headers);
  return {
    url: new URL(url),
    method: init.method,
    headers,
    body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
  };
}

export class MemoryTokenStore implements TokenStore {
  constructor(public token: string | null = null) {}
  get() {
    return this.token;
  }
  set(token: string) {
    this.token = token;
  }
  clear() {
    this.token = null;
  }
}
