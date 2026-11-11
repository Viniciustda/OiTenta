// Fonte dos dados do web: "example" (dados em memória do protótipo) ou "http" (backend real, padrão).
// Definida por NEXT_PUBLIC_DATA_SOURCE (ver apps/frontend/.env.example).
export type DataSource = "example" | "http";

export const resolveDataSource = (value: string | undefined): DataSource => (value === "example" ? "example" : "http");

/** Acesso literal para o Next.js embutir o valor no build. */
export const DATA_SOURCE: DataSource = resolveDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE);
