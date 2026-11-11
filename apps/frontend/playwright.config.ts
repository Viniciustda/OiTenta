import { defineConfig } from "@playwright/test";

// Teste de ponta a ponta do web (Etapa E). Decisão P25.
// Sobe o backend real (porta 4000, Postgres local no ar) e o web com NEXT_PUBLIC_DATA_SOURCE=http
// (porta 3000). O globalSetup zera os dados do usuário demo antes de cada execução.
export default defineConfig({
  testDir: "./e2e",
  // Só os *.spec.ts: os *.test.ts de e2e/support são do Vitest.
  testMatch: "**/*.spec.ts",
  globalSetup: "./e2e/global-setup.ts",
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3000",
    timezoneId: "America/Sao_Paulo",
    locale: "pt-BR",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      name: "backend",
      cwd: "../backend",
      command: "npx turbo run build --filter=@oitenta/backend && node dist/main",
      url: "http://localhost:4000/docs",
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: "pipe",
    },
    {
      name: "frontend",
      command: "npx next dev --port 3000",
      url: "http://localhost:3000/entrar",
      env: { NEXT_PUBLIC_DATA_SOURCE: "http", NEXT_PUBLIC_API_URL: "http://localhost:4000" },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
