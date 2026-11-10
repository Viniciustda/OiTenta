import { RampOption, RampStepKind } from "../model";

export interface RampOptionSource {
  /**
   * Lista as opções de um degrau da rampa.
   * `microSteps` são os micro-passos da etapa atual, usados só no degrau `micro`.
   */
  listOptions(
    userId: string,
    stepKind: RampStepKind,
    microSteps?: string[],
  ): Promise<RampOption[]>;
}
