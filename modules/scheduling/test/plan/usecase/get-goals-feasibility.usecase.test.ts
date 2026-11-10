import { NotFoundError } from "@oitenta/shared";
import { CommitmentBusySource, GetGoalsFeasibility, PlanGoalInput, ScheduledBlock } from "../../../src";
import {
  FakeCommitmentRepository,
  FakeScheduledBlockRepository,
  FakeWeeklyAvailabilityRepository,
  GOAL_1,
  GOAL_2,
  makeAvailability,
  makeBlock,
  SAO_PAULO,
  stepId,
  USER_A,
  USER_B,
} from "../../mock";

const NOW = new Date("2026-11-10T12:00:00.000Z");
const CREATED = new Date("2026-11-01T12:00:00.000Z");

function goal(goalId: string, deadline: string, minutes: number, firstStep = 1): PlanGoalInput {
  return { goalId, deadline, createdAt: CREATED, steps: [{ stepId: stepId(firstStep), order: 1, remainingMinutes: minutes }] };
}

function makeSut(blocks: ScheduledBlock[] = []) {
  const blockRepository = new FakeScheduledBlockRepository(blocks);
  const useCase = new GetGoalsFeasibility(
    new FakeWeeklyAvailabilityRepository([makeAvailability(USER_A)]),
    blockRepository,
    new CommitmentBusySource(new FakeCommitmentRepository()),
  );
  return { blockRepository, useCase };
}

describe("GetGoalsFeasibility", () => {
  test("cenario 1: 2 objetivos que cabem sao feasible com a folga de cada um", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      userId: USER_A,
      timezone: SAO_PAULO,
      now: NOW,
      goals: [goal(GOAL_1, "2026-11-20", 120), goal(GOAL_2, "2026-11-24", 180, 10)],
    });

    expect(output.goals).toEqual([
      { goalId: GOAL_1, feasible: true, slackDays: 1, unscheduledMinutes: 0 },
      { goalId: GOAL_2, feasible: true, slackDays: 1, unscheduledMinutes: 0 },
    ]);
  });

  test("cenario 2: objetivo que nao cabe -> feasible = false com os minutos que faltam", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      userId: USER_A,
      timezone: SAO_PAULO,
      now: NOW,
      goals: [goal(GOAL_1, "2026-11-12", 600)],
    });

    expect(output.goals).toEqual([
      { goalId: GOAL_1, feasible: false, slackDays: 0, unscheduledMinutes: 360 },
    ]);
  });

  test("cenario 3: nenhum bloco e gravado (sem chamada de escrita)", async () => {
    const existing = makeBlock({ start: new Date("2026-11-12T22:00:00.000Z"), end: new Date("2026-11-12T23:00:00.000Z") });
    const { blockRepository, useCase } = makeSut([existing]);

    await useCase.execute({ userId: USER_A, timezone: SAO_PAULO, now: NOW, goals: [goal(GOAL_1, "2026-11-24", 300)] });

    expect(blockRepository.writeCalls).toBe(0);
    expect(blockRepository.blocks).toEqual([existing]);
  });

  test("cenario 4 (posse): so os blocos fixos do proprio usuario entram no calculo", async () => {
    const doneOfB = makeBlock({
      userId: USER_B,
      start: new Date("2026-11-10T10:00:00.000Z"),
      end: new Date("2026-11-10T12:00:00.000Z"),
      status: "done",
    });
    const { useCase } = makeSut([doneOfB]);

    const output = await useCase.execute({
      userId: USER_A,
      timezone: SAO_PAULO,
      now: NOW,
      goals: [goal(GOAL_1, "2026-11-13", 240)],
    });

    expect(output.goals[0]).toEqual({ goalId: GOAL_1, feasible: true, slackDays: 1, unscheduledMinutes: 0 });
  });

  test("os blocos fixos do proprio usuario contam no calculo", async () => {
    const doneOfA = makeBlock({
      start: new Date("2026-11-10T10:00:00.000Z"),
      end: new Date("2026-11-10T12:00:00.000Z"),
      status: "done",
    });
    const { useCase } = makeSut([doneOfA]);

    const output = await useCase.execute({
      userId: USER_A,
      timezone: SAO_PAULO,
      now: NOW,
      goals: [goal(GOAL_1, "2026-11-13", 240)],
    });

    expect(output.goals[0]).toEqual({ goalId: GOAL_1, feasible: true, slackDays: 0, unscheduledMinutes: 0 });
  });

  test("usuario sem disponibilidade -> NotFoundError", async () => {
    const useCase = new GetGoalsFeasibility(
      new FakeWeeklyAvailabilityRepository(),
      new FakeScheduledBlockRepository(),
      new CommitmentBusySource(new FakeCommitmentRepository()),
    );

    await expect(
      useCase.execute({ userId: USER_A, timezone: SAO_PAULO, now: NOW, goals: [] }),
    ).rejects.toThrow(NotFoundError);
  });
});
