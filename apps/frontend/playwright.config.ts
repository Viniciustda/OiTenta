import { defineConfig } from "@playwright/test";

// Teste de ponta a ponta do web (Etapa E). Decisão P25.
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
});
