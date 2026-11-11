import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

// Fuso horário IANA (ex.: America/Sao_Paulo), verificado com o Intl nativo do JavaScript.
function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export class TimezoneRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "invalid.timezone", isValidTimezone);
  }
}
