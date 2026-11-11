// Erro no formato do filtro global do backend (docs/4-contrato-api.md, "Formato do erro").
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly error: string,
    message: string,
    readonly details?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (message: string) => new ApiError(400, "Bad Request", message);
export const unauthorized = (message = "Não autenticado") => new ApiError(401, "Unauthorized", message);
export const notFound = (message: string) => new ApiError(404, "Not Found", message);
export const conflict = (message: string) => new ApiError(409, "Conflict", message);
export const unprocessable = (details: string[]) => new ApiError(422, "Unprocessable Entity", "Regra de domínio violada", details);
