import { DomainError } from "./domain.error";

/** Serviço externo (IA, leitura de página, e-mail) indisponível, lento ou com resposta inválida. */
export class ServiceUnavailableError extends DomainError {
  constructor(message: string) {
    super(message, 503);
  }
}
