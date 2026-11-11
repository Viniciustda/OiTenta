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
    // Os testes de tela usam os dados de exemplo; os repositórios HTTP são testados com fetch simulado.
    env: { NEXT_PUBLIC_DATA_SOURCE: "example" },
  },
});
