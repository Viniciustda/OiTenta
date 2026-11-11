import { DateStringRule, RequiredRule, ValidationRule } from "@oitenta/shared";

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const dateStringRule = new DateStringRule();

/** Data local de calendário no formato `YYYY-MM-DD` (sem hora nem fuso). */
export class LocalDateRule implements ValidationRule {
  validate(value: unknown): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const valid =
      typeof value === "string" &&
      LOCAL_DATE_PATTERN.test(value) &&
      dateStringRule.validate(value) === null;

    return valid ? null : "local.date";
  }
}

/** Regras de uma data local obrigatória. */
export function localDateRules(): ValidationRule[] {
  return [new RequiredRule(), new LocalDateRule()];
}
