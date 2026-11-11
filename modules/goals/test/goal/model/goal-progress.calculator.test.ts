import { GoalProgressCalculator, ProgressStep } from "../../../src";

function step(
  estimatedMinutes: number,
  progressPct: number,
  status: ProgressStep["status"] = progressPct === 100 ? "done" : "pending",
): ProgressStep {
  return { estimatedMinutes, progressPct, status };
}

describe("GoalProgressCalculator", () => {
  test("cenario 1: 5 etapas de 60 min com uma em 100% -> 20% e 1 de 5", () => {
    const steps = [step(60, 100), step(60, 0), step(60, 0), step(60, 0), step(60, 0)];

    expect(GoalProgressCalculator.goalProgressPct(steps)).toBe(20);
    expect(GoalProgressCalculator.summary(steps)).toEqual({ done: 1, total: 5 });
  });

  test("cenario 2: 30 min (100%) e 90 min (0%) -> 25 (media ponderada)", () => {
    expect(GoalProgressCalculator.goalProgressPct([step(30, 100), step(90, 0)])).toBe(25);
  });

  test("cenario 3: 60 min com 50% -> faltam 30", () => {
    expect(GoalProgressCalculator.remainingMinutes(step(60, 50))).toBe(30);
  });

  test("cenario 4: 45 min com 50% -> faltam 30 (22,5 para cima ao multiplo de 15)", () => {
    expect(GoalProgressCalculator.remainingMinutes(step(45, 50))).toBe(30);
  });

  test("cenario 5: superseded 60 min em 50% + nova de 30 min em 0% -> 50", () => {
    const steps = [step(60, 50, "superseded"), step(30, 0)];

    expect(GoalProgressCalculator.goalProgressPct(steps)).toBe(50);
  });

  test("cenario 6: todas em 0% -> 0; todas em 100% -> 100", () => {
    expect(GoalProgressCalculator.goalProgressPct([step(30, 0), step(60, 0)])).toBe(0);
    expect(GoalProgressCalculator.goalProgressPct([step(30, 100), step(60, 100)])).toBe(100);
  });

  test("cenario 7: etapa superseded -> faltam 0", () => {
    expect(GoalProgressCalculator.remainingMinutes(step(60, 50, "superseded"))).toBe(0);
  });

  test("etapa done -> faltam 0; etapa intacta -> faltam a estimativa inteira", () => {
    expect(GoalProgressCalculator.remainingMinutes(step(60, 100))).toBe(0);
    expect(GoalProgressCalculator.remainingMinutes(step(45, 0))).toBe(45);
  });

  test("deve arredondar o % para inteiro", () => {
    // 15*100 / (15+30) = 33,33...
    expect(GoalProgressCalculator.goalProgressPct([step(15, 100), step(30, 0)])).toBe(33);
  });

  test("lista vazia ou so superseded em 0% -> 0 e resumo 0 de 0", () => {
    expect(GoalProgressCalculator.goalProgressPct([])).toBe(0);
    expect(GoalProgressCalculator.goalProgressPct([step(60, 0, "superseded")])).toBe(0);
    expect(GoalProgressCalculator.summary([step(60, 0, "superseded")])).toEqual({
      done: 0,
      total: 0,
    });
  });

  test("summary nao conta etapas superseded", () => {
    const steps = [step(60, 50, "superseded"), step(30, 100), step(30, 0)];

    expect(GoalProgressCalculator.summary(steps)).toEqual({ done: 1, total: 2 });
  });
});
