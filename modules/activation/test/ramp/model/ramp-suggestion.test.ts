import { RampSuggestion } from "../../../src";

describe("RampSuggestion", () => {
  const suggestion = new RampSuggestion();

  test("1. energia low sugere warmup", () => {
    expect(suggestion.suggestedStep("low")).toBe("warmup");
  });

  test("2. energia medium sugere challenge", () => {
    expect(suggestion.suggestedStep("medium")).toBe("challenge");
  });

  test("3. energia high sugere micro", () => {
    expect(suggestion.suggestedStep("high")).toBe("micro");
  });

  test("4. energia electric sugere focus", () => {
    expect(suggestion.suggestedStep("electric")).toBe("focus");
  });
});
