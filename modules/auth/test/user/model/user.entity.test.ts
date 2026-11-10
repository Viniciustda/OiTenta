import { ValidationException } from "@oitenta/shared";
import { User, UserState } from "../../../src";

const VALID_HASH =
  "$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZa";

function makeState(overrides: Partial<UserState> = {}): UserState {
  return {
    name: "Ana Souza",
    email: "ana@bora.app",
    password: VALID_HASH,
    ...overrides,
  };
}

function getValidationMessages(callback: () => void): string[] {
  try {
    callback();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("User", () => {
  test("deve criar usuario valido e expor os getters", () => {
    const user = new User(makeState());

    expect(user.name).toBe("Ana Souza");
    expect(user.email).toBe("ana@bora.app");
    expect(user.password).toBe(VALID_HASH);
    expect(user.id).toEqual(expect.any(String));
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(user.deletedAt).toBeNull();
  });

  test("deve passar no validate com dados validos", () => {
    const user = new User(makeState());

    expect(() => user.validate()).not.toThrow();
  });

  test("deve permitir existir invalido ate chamar validate (validacao lazy)", () => {
    const user = new User(makeState({ name: "", email: "x", password: "123" }));

    expect(user.name).toBe("");
    expect(() => user.validate()).toThrow(ValidationException);
  });

  test("deve acusar todos os campos obrigatorios vazios", () => {
    const user = new User(makeState({ name: "", email: "", password: "" }));

    expect(getValidationMessages(() => user.validate())).toEqual([
      "user.name.required",
      "user.email.required",
      "user.password.required",
    ]);
  });

  test("deve rejeitar nome com uma palavra so", () => {
    const user = new User(makeState({ name: "Ana" }));

    expect(getValidationMessages(() => user.validate())).toEqual([
      "user.name.person.name",
    ]);
  });

  test("deve rejeitar nome curto demais", () => {
    const user = new User(makeState({ name: "A" }));

    expect(getValidationMessages(() => user.validate())).toContain(
      "user.name.min.length",
    );
  });

  test("deve rejeitar nome com mais de 80 caracteres", () => {
    const user = new User(makeState({ name: `Ana ${"a".repeat(80)}` }));

    expect(getValidationMessages(() => user.validate())).toEqual([
      "user.name.max.length",
    ]);
  });

  test("deve aceitar nome com exatamente 80 caracteres", () => {
    const user = new User(makeState({ name: `Ana ${"a".repeat(76)}` }));

    expect(() => user.validate()).not.toThrow();
  });

  test("deve rejeitar e-mail invalido", () => {
    const user = new User(makeState({ email: "ana.bora.app" }));

    expect(getValidationMessages(() => user.validate())).toEqual([
      "user.email.invalid.email",
    ]);
  });

  test("deve rejeitar senha que nao esta em hash bcrypt", () => {
    const user = new User(makeState({ password: "SenhaForte@123" }));

    expect(getValidationMessages(() => user.validate())).toEqual([
      "user.password.bcrypt.hash",
    ]);
  });

  test("deve preservar id e createdAt no clone e atualizar updatedAt", () => {
    const createdAt = new Date("2026-11-01T10:00:00.000Z");
    const user = new User(makeState({ createdAt, updatedAt: createdAt }));

    const cloned = user.clone({ name: "Ana Lima" });

    expect(cloned.id).toBe(user.id);
    expect(cloned.createdAt).toEqual(createdAt);
    expect(cloned.updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
    expect(cloned.name).toBe("Ana Lima");
    expect(user.name).toBe("Ana Souza");
  });
});
