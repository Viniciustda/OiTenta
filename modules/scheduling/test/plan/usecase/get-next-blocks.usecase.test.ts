import { GetNextBlocks } from "../../../src";
import { FakeScheduledBlockRepository, GOAL_1, GOAL_2, makeBlock, stepId, USER_A, USER_B } from "../../mock";

const NOW = new Date("2026-11-10T12:00:00.000Z");

function at(iso: string) {
  return { start: new Date(iso), end: new Date(new Date(iso).getTime() + 60 * 60_000) };
}

describe("GetNextBlocks", () => {
  test("por etapa, devolve o bloco planned futuro de menor start", async () => {
    const later = makeBlock({ stepId: stepId(1), ...at("2026-11-12T22:00:00.000Z") });
    const first = makeBlock({ stepId: stepId(1), ...at("2026-11-11T22:00:00.000Z") });
    const step2 = makeBlock({ stepId: stepId(2), ...at("2026-11-13T22:00:00.000Z") });
    const useCase = new GetNextBlocks(new FakeScheduledBlockRepository([later, step2, first]));

    const output = await useCase.execute({ userId: USER_A, goalId: GOAL_1, now: NOW });

    expect(output.byStep).toEqual({
      [stepId(1)]: { id: first.id, start: first.start, end: first.end },
      [stepId(2)]: { id: step2.id, start: step2.start, end: step2.end },
    });
  });

  test("posse: os blocos de outro usuario nunca aparecem", async () => {
    const ofB = makeBlock({ userId: USER_B, ...at("2026-11-11T22:00:00.000Z") });
    const useCase = new GetNextBlocks(new FakeScheduledBlockRepository([ofB]));

    const output = await useCase.execute({ userId: USER_A, goalId: GOAL_1, now: NOW });

    expect(output.byStep).toEqual({});
  });

  test("bloco que ja passou e ignorado", async () => {
    const past = makeBlock({ ...at("2026-11-09T22:00:00.000Z") });
    const useCase = new GetNextBlocks(new FakeScheduledBlockRepository([past]));

    const output = await useCase.execute({ userId: USER_A, goalId: GOAL_1, now: NOW });

    expect(output.byStep).toEqual({});
  });

  test("blocos done, partial e missed sao ignorados", async () => {
    const blocks = (["done", "partial", "missed"] as const).map((status, index) =>
      makeBlock({ status, ...at(`2026-11-1${index + 1}T22:00:00.000Z`) }),
    );
    const useCase = new GetNextBlocks(new FakeScheduledBlockRepository(blocks));

    const output = await useCase.execute({ userId: USER_A, goalId: GOAL_1, now: NOW });

    expect(output.byStep).toEqual({});
  });

  test("blocos de outro objetivo do mesmo usuario sao ignorados", async () => {
    const other = makeBlock({ goalId: GOAL_2, ...at("2026-11-11T22:00:00.000Z") });
    const useCase = new GetNextBlocks(new FakeScheduledBlockRepository([other]));

    const output = await useCase.execute({ userId: USER_A, goalId: GOAL_1, now: NOW });

    expect(output.byStep).toEqual({});
  });

  test("desempate deterministico: mesmo start -> menor end, depois menor id", async () => {
    const start = new Date("2026-11-11T22:00:00.000Z");
    const longer = makeBlock({ start, end: new Date("2026-11-11T23:30:00.000Z") });
    const shortB = makeBlock({ id: "99999999-9999-4999-8999-999999999999", start, end: new Date("2026-11-11T22:30:00.000Z") });
    const shortA = makeBlock({ id: "00000000-0000-4000-8000-000000000001", start, end: new Date("2026-11-11T22:30:00.000Z") });

    const results = await Promise.all(
      [[longer, shortB, shortA], [shortA, longer, shortB], [shortB, shortA, longer]].map((order) =>
        new GetNextBlocks(new FakeScheduledBlockRepository(order)).execute({
          userId: USER_A,
          goalId: GOAL_1,
          now: NOW,
        }),
      ),
    );

    expect(results.map((output) => output.byStep[stepId(1)].id)).toEqual([shortA.id, shortA.id, shortA.id]);
  });

  test("bloco no limite: start igual a now entra", async () => {
    const block = makeBlock({ start: NOW, end: new Date(NOW.getTime() + 30 * 60_000) });
    const useCase = new GetNextBlocks(new FakeScheduledBlockRepository([block]));

    const output = await useCase.execute({ userId: USER_A, goalId: GOAL_1, now: NOW });

    expect(output.byStep[stepId(1)]?.id).toBe(block.id);
  });

  test("etapa sem bloco fica fora do mapa", async () => {
    const block = makeBlock({ stepId: stepId(1), ...at("2026-11-11T22:00:00.000Z") });
    const useCase = new GetNextBlocks(new FakeScheduledBlockRepository([block]));

    const output = await useCase.execute({ userId: USER_A, goalId: GOAL_1, now: NOW });

    expect(Object.keys(output.byStep)).toEqual([stepId(1)]);
  });

  test("busca de now ate now + 366 dias no repositorio", async () => {
    const repository = new FakeScheduledBlockRepository();
    const spy = jest.spyOn(repository, "findByUserInRange");

    await new GetNextBlocks(repository).execute({ userId: USER_A, goalId: GOAL_1, now: NOW });

    expect(spy).toHaveBeenCalledWith(USER_A, NOW, new Date("2027-11-11T12:00:00.000Z"));
  });
});
