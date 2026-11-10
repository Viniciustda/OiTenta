import {
  FixedRampOptionSource,
  RampOption,
  RampOptionSource,
  RampStepKind,
} from "../../src";

export interface RampOptionSourceCall {
  userId: string;
  stepKind: RampStepKind;
}

/** Fonte que delega ao catálogo fixo e registra cada chamada recebida. */
export class FakeRampOptionSource implements RampOptionSource {
  readonly calls: RampOptionSourceCall[] = [];
  private readonly fixed = new FixedRampOptionSource();

  async listOptions(
    userId: string,
    stepKind: RampStepKind,
  ): Promise<RampOption[]> {
    this.calls.push({ userId, stepKind });
    return this.fixed.listOptions(userId, stepKind);
  }
}
