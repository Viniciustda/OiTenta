import { TimezoneRule } from "../../../src/index";

describe("TimezoneRule", () => {
  const rule = new TimezoneRule();

  test("deve aceitar identificadores IANA validos", () => {
    expect(rule.validate("America/Sao_Paulo")).toBeNull();
    expect(rule.validate("America/Manaus")).toBeNull();
    expect(rule.validate("UTC")).toBeNull();
  });

  test("deve reprovar fuso inexistente ou mal formado", () => {
    expect(rule.validate("Lua/Base")).toBe("invalid.timezone");
    expect(rule.validate("sao paulo")).toBe("invalid.timezone");
    expect(rule.validate(123)).toBe("invalid.timezone");
  });

  test("deve ignorar valor vazio (obrigatoriedade e responsabilidade da RequiredRule)", () => {
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
    expect(rule.validate(undefined)).toBeNull();
  });
});
