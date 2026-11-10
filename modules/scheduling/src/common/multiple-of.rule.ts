import { ValidationRule } from "@oitenta/shared";

/**
 * Regra local do módulo: o número (ou cada número de uma lista) precisa ser
 * múltiplo de `factor`. Valores que não são números passam: quem exige
 * presença e tipo são a RequiredRule e a IntegerRule.
 */
export class MultipleOfRule implements ValidationRule {
  constructor(readonly factor: number) {}

  validate(value: unknown): string | null {
    const values = Array.isArray(value) ? value : [value];
    const valid = values.every(
      (item) => typeof item !== "number" || !Number.isFinite(item) || item % this.factor === 0,
    );
    return valid ? null : "multiple.of";
  }
}
