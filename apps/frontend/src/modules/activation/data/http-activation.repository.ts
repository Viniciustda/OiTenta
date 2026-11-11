import type { HttpClient } from "@/modules/core/data/http-client";
import type { ActivationRepository } from "./activation.repository";
import type { GetRampInput, RampResponse, RecordSessionInput, RecordSessionResponse } from "./activation.types";

// /activation/* no backend real (docs/4-contrato-api.md §5).
export class HttpActivationRepository implements ActivationRepository {
  constructor(private readonly http: HttpClient) {}

  getRamp({ goalId, stepId, energy, availableTime }: GetRampInput): Promise<RampResponse> {
    return this.http.get<RampResponse>("/activation/ramp", { goalId, stepId, energy, availableTime });
  }

  recordSession({ blockId, ...rest }: RecordSessionInput): Promise<RecordSessionResponse> {
    // blockId é opcional no corpo: sem bloco, o campo não vai.
    return this.http.post<RecordSessionResponse>("/activation/sessions", blockId ? { ...rest, blockId } : rest);
  }
}
