import { type DataSource, DATA_SOURCE } from "./data-source";

// Relógio das telas. Nos dados de exemplo, "agora" é o do protótipo: segunda, 16/11/2026, 19:40
// em São Paulo (Bora App.dc.html: NOW = 19:40, dia 0 = 16/11). Com o backend real (http), é o relógio do sistema.
export interface Clock {
  now(): string;
}

export class ExampleClock implements Clock {
  now() {
    return "2026-11-16T22:40:00.000Z";
  }
}

/**
 * Marcador devolvido no servidor. O Next.js (Cache Components) não aceita ler a hora durante o
 * prerender de um Client Component; as telas só mostram datas depois de carregar os dados no navegador.
 */
export const SERVER_NOW = "1970-01-01T00:00:00.000Z";

const MINUTE = 60_000;

/**
 * Relógio real. Trunca no minuto para o valor ficar estável entre renders: as telas usam `now` como
 * dependência de efeito e recarregariam a cada render se ele mudasse a cada milissegundo.
 */
export class SystemClock implements Clock {
  constructor(
    private readonly nowMs: () => number = () => Date.now(),
    private readonly isBrowser: () => boolean = () => typeof window !== "undefined",
  ) {}

  now() {
    if (!this.isBrowser()) return SERVER_NOW;
    return new Date(Math.floor(this.nowMs() / MINUTE) * MINUTE).toISOString();
  }
}

export const createClock = (source: DataSource): Clock => (source === "example" ? new ExampleClock() : new SystemClock());

export const clock: Clock = createClock(DATA_SOURCE);
