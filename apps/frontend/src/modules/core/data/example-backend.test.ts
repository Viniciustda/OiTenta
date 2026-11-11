import { describe, expect, it } from "vitest";
import { ExampleBackend } from "./example-backend";

describe("ExampleBackend", () => {
  it("reset volta ao estado inicial dos dados de exemplo", () => {
    const b = new ExampleBackend();
    b.blocks[0].status = "done";
    b.goals.pop();
    b.sessionUserId = "x";
    b.reset();
    expect(b.blocks[0].status).toBe("planned");
    expect(b.goals).toHaveLength(3);
    expect(b.sessionUserId).toBeNull();
  });

  it("o resumo do plano conta dias pela data local do usuário, não pela data UTC", () => {
    const b = new ExampleBackend();
    b.blocks = [
      { id: "1", goalId: "goal-eng", stepId: "step-e5", start: "2026-11-16T23:00:00.000Z", end: "2026-11-17T00:00:00.000Z", status: "planned" },
      { id: "2", goalId: "goal-eng", stepId: "step-e6", start: "2026-11-17T01:15:00.000Z", end: "2026-11-17T02:00:00.000Z", status: "planned" },
    ];
    expect(b.planSummary().days).toBe(1);
  });
});
