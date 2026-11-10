import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes de comportamento do web (repositórios e lógica de tela). Decisão P21.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
