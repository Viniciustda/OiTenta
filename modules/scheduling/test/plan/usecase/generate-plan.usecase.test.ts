import { NotFoundError } from "@oitenta/shared";
import {
  Commitment,
  CommitmentBusySource,
  GeneratePlan,
  PlanGoalInput,
  ScheduledBlock,
} from "../../../src";
import {
  FakeCommitmentRepository,
  FakeScheduledBlockRepository,
  FakeWeeklyAvailabilityRepository,
  GOAL_1,
  makeAvailability,
  makeBlock,
  SAO_PAULO,
  stepId,
  USER_A,
  USER_B,
} from "../../mock";

// Terca 10/11/2026, 09:00 em Sao Paulo.
const NOW = new Date("2026-11-10T12:00:00.000Z");

const GOAL: PlanGoalInput = {
  goalId: GOAL_1,
  deadline: "2026-11-24",
  createdAt: new Date("2026-11-01T12:00:00.000Z"),
  steps: [
    { stepId: stepId(1), order: 1, remainingMinutes: 60 },
    { stepId: stepId(2), order: 2, remainingMinutes: 90 },
  ],
};

function makeSut(blocks: ScheduledBlock[] = [], commitments: Commitment[] = []) {
  const availabilityRepository = new FakeWeeklyAvailabilityRepository([
    makeAvailability(USER_A),
    makeAvailability(USER_B),
  ]);
  const blockRepository = new FakeScheduledBlockRepository(blocks);
  const busySource = new CommitmentBusySource(new FakeCommitmentRepository(commitments));
  const useCase = new GeneratePlan(availabilityRepository, blockRepository, busySource);
  return { availabilityRepository, blockRepository, useCase };
}

describe("GeneratePlan", () => {
  test("cenario 1: com disponibilidade e 1 objetivo grava os blocos e devolve o resumo", async () => {
    const { blockRepository, useCase } = makeSut();

    const output = await useCase.execute({ userId: USER_A, timezone: SAO_PAULO, now: NOW, goals: [GOAL] });

    expect(output.summary).toEqual({ totalMinutes: 150, days: 2 });
    expect(output.goals).toEqual([
      {
        goalId: GOAL_1,
        scheduledMinutes: 150,
        unscheduledMinutes: 0,
        feasible: true,
        usedSlack: true,
        slackDays: 1,
      },
    ]);
    expect(blockRepository.blocks).toEqual(output.blocks);
    expect(output.blocks.map((block) => [block.start.toISOString(), block.end.toISOString()])).toEqual([
      ["2026-11-10T22:00:00.000Z", "2026-11-10T23:00:00.000Z"],
      ["2026-11-10T23:00:00.000Z", "2026-11-11T00:00:00.000Z"],
      ["2026-11-11T22:00:00.000Z", "2026-11-11T22:30:00.000Z"],
    ]);
    for (const block of output.blocks) {
      expect(block).toBeInstanceOf(ScheduledBlock);
      expect(block.userId).toBe(USER_A);
      expect(block.status).toBe("planned");
      expect(block.pinned).toBe(false);
      expect(block.origin).toBe("auto");
    }
  });

  test("cenario 2: recalculo preserva ontem (missed), hoje (done) e o futuro fixado", async () => {
    const yesterday = makeBlock({
      start: new Date("2026-11-09T22:00:00.000Z"),
      end: new Date("2026-11-09T23:00:00.000Z"),
      status: "missed",
    });
    const today = makeBlock({
      start: new Date("2026-11-10T10:00:00.000Z"),
      end: new Date("2026-11-10T11:00:00.000Z"),
      status: "done",
    });
    const pinned = makeBlock({
      start: new Date("2026-11-11T22:00:00.000Z"),
      end: new Date("2026-11-11T23:00:00.000Z"),
      pinned: true,
    });
    const oldFuture = makeBlock({
      start: new Date("2026-11-12T22:00:00.000Z"),
      end: new Date("2026-11-12T23:00:00.000Z"),
    });
    const { blockRepository, useCase } = makeSut([yesterday, today, pinned, oldFuture]);

    const output = await useCase.execute({ userId: USER_A, timezone: SAO_PAULO, now: NOW, goals: [GOAL] });

    const stored = blockRepository.blocks;
    expect(stored).toEqual(expect.arrayContaining([yesterday, today, pinned]));
    expect(stored).not.toContain(oldFuture);
    expect(stored).toHaveLength(3 + output.blocks.length);
    // O bloco de hoje (60 min) e o fixado de amanha (60 min) contam para o limite de 120.
    expect(output.blocks.map((block) => block.start.toISOString())).toEqual([
      "2026-11-10T22:00:00.000Z",
      "2026-11-11T23:00:00.000Z",
      "2026-11-12T22:00:00.000Z",
    ]);
  });

  test("compromissos do usuario ocupam a agenda", async () => {
    const commitment = new Commitment({
      userId: USER_A,
      title: "Curso",
      kind: "commitment",
      startDate: "2026-11-10",
      startMinute: 19 * 60,
      durationMinutes: 60,
      recurrence: null,
    });
    const { useCase } = makeSut([], [commitment]);

    const output = await useCase.execute({ userId: USER_A, timezone: SAO_PAULO, now: NOW, goals: [GOAL] });

    expect(output.blocks[0]?.start.toISOString()).toBe("2026-11-10T23:00:00.000Z");
  });

  test("cenario 3: usuario sem disponibilidade -> NotFoundError e nada e gravado (P12)", async () => {
    const blockRepository = new FakeScheduledBlockRepository();
    const useCase = new GeneratePlan(
      new FakeWeeklyAvailabilityRepository(),
      blockRepository,
      new CommitmentBusySource(new FakeCommitmentRepository()),
    );

    await expect(
      useCase.execute({ userId: USER_A, timezone: SAO_PAULO, now: NOW, goals: [GOAL] }),
    ).rejects.toThrow(NotFoundError);
    expect(blockRepository.writeCalls).toBe(0);
  });

  test("cenario 4 (posse): os blocos de B nao sao tocados quando A gera o plano", async () => {
    const ofB = makeBlock({
      userId: USER_B,
      start: new Date("2026-11-10T22:00:00.000Z"),
      end: new Date("2026-11-11T00:00:00.000Z"),
    });
    const { blockRepository, useCase } = makeSut([ofB]);

    const output = await useCase.execute({ userId: USER_A, timezone: SAO_PAULO, now: NOW, goals: [GOAL] });

    expect(blockRepository.blocks).toContain(ofB);
    // Os blocos de B nao ocupam o horario nem o limite de A.
    expect(output.blocks[0]?.start.toISOString()).toBe("2026-11-10T22:00:00.000Z");
  });

  test("objetivo sem prazo usa o horizonte padrao do plano", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      userId: USER_A,
      timezone: SAO_PAULO,
      now: NOW,
      goals: [{ ...GOAL, deadline: null, steps: [{ stepId: stepId(1), order: 1, remainingMinutes: 120 * 40 }] }],
    });

    const lastDay = output.blocks[output.blocks.length - 1]?.start.toISOString().slice(0, 10);
    expect(lastDay).toBe("2026-12-07");
    expect(output.goals[0]?.feasible).toBe(true);
  });

  test("prazo alem do horizonte padrao estende o periodo do plano", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      userId: USER_A,
      timezone: SAO_PAULO,
      now: NOW,
      goals: [{ ...GOAL, deadline: "2027-01-15", steps: [{ stepId: stepId(1), order: 1, remainingMinutes: 120 * 40 }] }],
    });

    const lastDay = output.blocks[output.blocks.length - 1]?.start.toISOString().slice(0, 10);
    expect(lastDay).toBe("2026-12-19");
    expect(output.goals[0]?.feasible).toBe(true);
  });
});
