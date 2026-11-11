// Relógio das telas. Nos dados de exemplo, "agora" é o do protótipo: segunda, 16/11/2026, 19:40
// em São Paulo (Bora App.dc.html: NOW = 19:40, dia 0 = 16/11). Na Etapa D vira o relógio real.
export interface Clock {
  now(): string;
}

export class ExampleClock implements Clock {
  now() {
    return "2026-11-16T22:40:00.000Z";
  }
}

export const clock: Clock = new ExampleClock();
