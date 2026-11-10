import {
  AvailabilityCalculator,
  Interval,
  localToUtc,
  minutesBetween,
  PlanBlock,
  PlanCalculator,
  PlanCalculatorInput,
  PlanGoalInput,
  toLocalParts,
} from "../../../src";
import { GOAL_1, GOAL_2, GOAL_3, GOAL_4, SAO_PAULO, stepId } from "../../mock";

const calculator = new PlanCalculator();
// Terca 10/11/2026, 09:00 em Sao Paulo.
const NOW = new Date("2026-11-10T12:00:00.000Z");
const CREATED = new Date("2026-11-01T12:00:00.000Z");

function everyEvening(fromDate: string, toDateExclusive: string): Interval[] {
  return new AvailabilityCalculator().freeIntervals({
    windows: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      weekday,
      startMinute: 19 * 60,
      endMinute: 23 * 60,
    })),
    timezone: SAO_PAULO,
    from: localToUtc(fromDate, 0, SAO_PAULO),
    to: localToUtc(toDateExclusive, 0, SAO_PAULO),
    busy: [],
    now: NOW,
  });
}

function local(date: string, hour: number, minute = 0): Date {
  return localToUtc(date, hour * 60 + minute, SAO_PAULO);
}

function goal(
  goalId: string,
  deadline: string | null,
  minutes: number[],
  createdAt = CREATED,
  firstStep = 1,
): PlanGoalInput {
  return {
    goalId,
    deadline,
    createdAt,
    steps: minutes.map((remainingMinutes, index) => ({
      stepId: stepId(firstStep + index),
      order: index + 1,
      remainingMinutes,
    })),
  };
}

function makeInput(overrides: Partial<PlanCalculatorInput> = {}): PlanCalculatorInput {
  return {
    now: NOW,
    timezone: SAO_PAULO,
    freeIntervals: everyEvening("2026-11-10", "2026-12-31"),
    dailyLimitMinutes: 120,
    fixedBlocks: [],
    goals: [],
    ...overrides,
  };
}

function dayOf(block: { start: Date }): string {
  return toLocalParts(block.start, SAO_PAULO).date;
}

function minutesByDay(blocks: PlanBlock[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const block of blocks) {
    const day = dayOf(block);
    result.set(day, (result.get(day) ?? 0) + minutesBetween(block.start, block.end));
  }
  return result;
}

function sum(blocks: PlanBlock[]): number {
  return blocks.reduce((total, block) => total + minutesBetween(block.start, block.end), 0);
}

describe("PlanCalculator", () => {
  describe("cenario 1: exemplo das 7 etapas (F 4 e 5), invariantes (P11)", () => {
    const estimates = [30, 60, 45, 90, 90, 60, 120];
    const result = calculator.calculate(
      makeInput({
        freeIntervals: everyEvening("2026-11-10", "2026-11-24"),
        goals: [goal(GOAL_1, "2026-11-24", estimates)],
      }),
    );
    const blocks = result.blocks;

    test("aloca os 495 min, cada etapa com a sua estimativa", () => {
      expect(sum(blocks)).toBe(495);
      estimates.forEach((estimate, index) => {
        const ofStep = blocks.filter((block) => block.stepId === stepId(index + 1));
        expect(sum(ofStep)).toBe(estimate);
      });
    });

    test("nenhum bloco depois de 22/11 (prazo 24/11 - 1 - folga, P9)", () => {
      expect(blocks.every((block) => dayOf(block) <= "2026-11-22")).toBe(true);
    });

    test("etapas em ordem: nenhum bloco da etapa n antes do fim da n-1", () => {
      for (let index = 1; index < estimates.length; index++) {
        const previous = blocks.filter((block) => block.stepId === stepId(index));
        const current = blocks.filter((block) => block.stepId === stepId(index + 1));
        const previousEnd = Math.max(...previous.map((block) => block.end.getTime()));
        const currentStart = Math.min(...current.map((block) => block.start.getTime()));
        expect(currentStart).toBeGreaterThanOrEqual(previousEnd);
      }
    });

    test("nenhum dia passa de 120 min", () => {
      for (const minutes of minutesByDay(blocks).values()) {
        expect(minutes).toBeLessThanOrEqual(120);
      }
    });

    test("nenhum bloco menor que 30 min, exceto o resto final da etapa (P10)", () => {
      for (const block of blocks) {
        if (minutesBetween(block.start, block.end) >= 30) continue;
        const ofStep = blocks.filter((item) => item.stepId === block.stepId);
        expect(ofStep[ofStep.length - 1]).toBe(block);
      }
    });

    test("feasible = true e usedSlack = true, com o resumo do plano", () => {
      expect(result.goals).toEqual([
        {
          goalId: GOAL_1,
          scheduledMinutes: 495,
          unscheduledMinutes: 0,
          feasible: true,
          usedSlack: true,
          slackDays: 1,
        },
      ]);
      expect(result.summary.totalMinutes).toBe(495);
      expect(result.summary.days).toBe(minutesByDay(blocks).size);
    });
  });

  test("cenario 2: limite somado entre objetivos, o de prazo mais cedo primeiro", () => {
    const result = calculator.calculate(
      makeInput({
        freeIntervals: everyEvening("2026-11-11", "2026-11-12"),
        goals: [
          goal(GOAL_2, "2026-11-25", [120], CREATED, 10),
          goal(GOAL_1, "2026-11-20", [120]),
        ],
      }),
    );

    expect(minutesByDay(result.blocks).get("2026-11-11")).toBe(120);
    expect(result.blocks.every((block) => block.goalId === GOAL_1)).toBe(true);
  });

  test("cenario 3: o objetivo de prazo 15/11 vem antes do de prazo 20/11", () => {
    const result = calculator.calculate(
      makeInput({
        goals: [goal(GOAL_1, "2026-11-20", [60]), goal(GOAL_2, "2026-11-15", [60], CREATED, 10)],
      }),
    );
    const firstOfA = result.blocks.find((block) => block.goalId === GOAL_1) as PlanBlock;
    const lastOfB = result.blocks.filter((block) => block.goalId === GOAL_2).pop() as PlanBlock;

    expect(lastOfB.end.getTime()).toBeLessThanOrEqual(firstOfA.start.getTime());
    expect(result.blocks[0]?.goalId).toBe(GOAL_2);
  });

  test("cenario 4: so cabe usando o dia da folga -> feasible e usedSlack = false", () => {
    const result = calculator.calculate(
      makeInput({ goals: [goal(GOAL_1, "2026-11-13", [300])] }),
    );

    expect(result.goals[0]).toEqual({
      goalId: GOAL_1,
      scheduledMinutes: 300,
      unscheduledMinutes: 0,
      feasible: true,
      usedSlack: false,
      slackDays: 0,
    });
    expect(result.blocks.every((block) => dayOf(block) <= "2026-11-12")).toBe(true);
  });

  test("cenario 5: 600 min com prazo em 2 dias e limite 120 -> inviavel com o restante", () => {
    const result = calculator.calculate(
      makeInput({ goals: [goal(GOAL_1, "2026-11-12", [600])] }),
    );

    expect(sum(result.blocks)).toBe(240);
    expect(result.goals[0]).toEqual({
      goalId: GOAL_1,
      scheduledMinutes: 240,
      unscheduledMinutes: 360,
      feasible: false,
      usedSlack: false,
      slackDays: 0,
    });
  });

  test("cenario 6: bloco concluido hoje de 60 min deixa so mais 60 min hoje e nao e alterado", () => {
    const fixed = { start: local("2026-11-10", 7), end: local("2026-11-10", 8) };
    const snapshot = { start: new Date(fixed.start), end: new Date(fixed.end) };

    const result = calculator.calculate(
      makeInput({ fixedBlocks: [fixed], goals: [goal(GOAL_1, "2026-11-30", [300])] }),
    );

    expect(minutesByDay(result.blocks).get("2026-11-10")).toBe(60);
    expect(fixed).toEqual(snapshot);
  });

  test("cenario 7: bloco fixado no futuro nao e usado por outra etapa e conta para o limite", () => {
    const pinned = { start: local("2026-11-11", 19), end: local("2026-11-11", 20) };

    const result = calculator.calculate(
      makeInput({ fixedBlocks: [pinned], goals: [goal(GOAL_1, "2026-11-30", [600])] }),
    );
    const overlapping = result.blocks.filter(
      (block) => block.start < pinned.end && block.end > pinned.start,
    );

    expect(overlapping).toEqual([]);
    expect(minutesByDay(result.blocks).get("2026-11-11")).toBe(60);
  });

  test("cenario 8: a mesma entrada duas vezes da a mesma saida", () => {
    const input = makeInput({
      goals: [
        goal(GOAL_1, "2026-11-24", [30, 60, 45]),
        goal(GOAL_2, null, [90], CREATED, 10),
      ],
    });

    expect(calculator.calculate(input)).toEqual(calculator.calculate(input));
  });

  test("cenario 9: etapa de 60 min a 50% (remaining 30) aloca so 30 min", () => {
    const result = calculator.calculate(
      makeInput({ goals: [goal(GOAL_1, "2026-11-24", [30])] }),
    );

    expect(sum(result.blocks)).toBe(30);
  });

  test("cenario 10: objetivo sem prazo vai depois do que tem prazo (P3)", () => {
    const result = calculator.calculate(
      makeInput({
        goals: [
          goal(GOAL_2, null, [60], new Date("2026-10-01T00:00:00.000Z"), 10),
          goal(GOAL_1, "2026-11-30", [60]),
        ],
      }),
    );

    expect(result.blocks.map((block) => block.goalId)).toEqual([GOAL_1, GOAL_2]);
    expect(result.goals.find((item) => item.goalId === GOAL_2)).toEqual({
      goalId: GOAL_2,
      scheduledMinutes: 60,
      unscheduledMinutes: 0,
      feasible: true,
      usedSlack: false,
      slackDays: null,
    });
  });

  test("cenario 11: nenhum objetivo -> blocks = []", () => {
    const result = calculator.calculate(makeInput());

    expect(result.blocks).toEqual([]);
    expect(result.goals).toEqual([]);
    expect(result.summary).toEqual({ totalMinutes: 0, days: 0 });
  });

  describe("casos de borda", () => {
    test("ordena etapas por ordem (e id no empate), ignora etapa sem resto e arredonda para 15 min", () => {
      const result = calculator.calculate(
        makeInput({
          goals: [
            {
              goalId: GOAL_1,
              deadline: "2026-11-30",
              createdAt: CREATED,
              steps: [
                { stepId: stepId(3), order: 2, remainingMinutes: 20 },
                { stepId: stepId(2), order: 1, remainingMinutes: 30 },
                { stepId: stepId(1), order: 1, remainingMinutes: 30 },
                { stepId: stepId(4), order: 3, remainingMinutes: 0 },
              ],
            },
          ],
        }),
      );

      expect(result.blocks.map((block) => [block.stepId, minutesBetween(block.start, block.end)])).toEqual([
        [stepId(1), 30],
        [stepId(2), 30],
        [stepId(3), 30],
      ]);
    });

    test("desempata prazos iguais pela criacao e depois pelo id", () => {
      const later = new Date("2026-11-05T00:00:00.000Z");
      const result = calculator.calculate(
        makeInput({
          goals: [
            goal(GOAL_3, "2026-11-30", [30], later, 20),
            goal(GOAL_2, "2026-11-30", [30], CREATED, 10),
            goal(GOAL_1, "2026-11-30", [30], CREATED),
            goal(GOAL_4, null, [30], CREATED, 30),
          ],
        }),
      );

      expect(result.blocks.map((block) => block.goalId)).toEqual([GOAL_1, GOAL_2, GOAL_3, GOAL_4]);
    });

    test("evita deixar resto menor que o bloco minimo e ocupa o intervalo inteiro quando cabe", () => {
      const result = calculator.calculate(
        makeInput({
          dailyLimitMinutes: 240,
          freeIntervals: [
            { start: local("2026-11-10", 19), end: local("2026-11-10", 20) },
            { start: local("2026-11-11", 19), end: local("2026-11-11", 21) },
          ],
          goals: [goal(GOAL_1, "2026-11-30", [75, 60])],
        }),
      );

      expect(result.blocks.map((block) => minutesBetween(block.start, block.end))).toEqual([45, 30, 60]);
    });

    test("bloco que ocupa o intervalo livre inteiro consome o intervalo", () => {
      const result = calculator.calculate(
        makeInput({
          freeIntervals: [
            { start: local("2026-11-10", 19), end: local("2026-11-10", 20) },
            { start: local("2026-11-11", 19), end: local("2026-11-11", 20) },
          ],
          goals: [goal(GOAL_1, "2026-11-30", [60, 60])],
        }),
      );

      expect(result.blocks.map(dayOf)).toEqual(["2026-11-10", "2026-11-11"]);
    });

    test("prazo ja vencido: nada e alocado e o objetivo e inviavel", () => {
      const result = calculator.calculate(
        makeInput({ goals: [goal(GOAL_1, "2026-11-10", [60])] }),
      );

      expect(result.blocks).toEqual([]);
      expect(result.goals[0]?.feasible).toBe(false);
      expect(result.goals[0]?.unscheduledMinutes).toBe(60);
    });

    test("a etapa seguinte nao comeca se a anterior nao coube", () => {
      const result = calculator.calculate(
        makeInput({ goals: [goal(GOAL_1, "2026-11-12", [300, 30])] }),
      );

      expect(result.blocks.every((block) => block.stepId === stepId(1))).toBe(true);
      expect(result.goals[0]?.unscheduledMinutes).toBe(60 + 30);
    });

    test("aceita folga, bloco minimo e granularidade configurados", () => {
      const result = calculator.calculate(
        makeInput({
          slackDays: 0,
          minBlockMinutes: 60,
          granularity: 30,
          goals: [goal(GOAL_1, "2026-11-11", [100])],
        }),
      );

      expect(sum(result.blocks)).toBe(120);
      expect(result.goals[0]).toEqual({
        goalId: GOAL_1,
        scheduledMinutes: 120,
        unscheduledMinutes: 0,
        feasible: true,
        usedSlack: true,
        slackDays: 0,
      });
    });
  });
});
