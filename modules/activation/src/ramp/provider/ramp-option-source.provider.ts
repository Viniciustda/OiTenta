import { RampOption, RampStepKind } from "../model";

export interface RampOptionSource {
  listOptions(userId: string, stepKind: RampStepKind): Promise<RampOption[]>;
}
