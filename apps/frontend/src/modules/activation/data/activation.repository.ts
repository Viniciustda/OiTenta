import type { GetRampInput, RampResponse, RecordSessionInput, RecordSessionResponse } from "./activation.types";

// Fronteira das telas com /activation/*. Etapa B: dados de exemplo; Etapa D: HTTP.
export interface ActivationRepository {
  getRamp(input: GetRampInput): Promise<RampResponse>;
  recordSession(input: RecordSessionInput): Promise<RecordSessionResponse>;
}
