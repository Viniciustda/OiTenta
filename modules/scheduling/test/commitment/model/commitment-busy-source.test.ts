import { Commitment, CommitmentBusySource, CommitmentState } from "../../../src";
import { FakeCommitmentRepository, SAO_PAULO, USER_A, USER_B } from "../../mock";

function makeCommitment(overrides: Partial<CommitmentState> = {}): Commitment {
  return new Commitment({
    userId: USER_A,
    title: "Aula",
    kind: "commitment",
    startDate: "2025-11-03",
    startMinute: 8 * 60,
    durationMinutes: 240,
    recurrence: { weekdays: [0, 1, 2, 3, 4] },
    ...overrides,
  });
}

describe("CommitmentBusySource", () => {
  test("devolve as ocorrencias do usuario dentro do periodo, em ordem", async () => {
    const repository = new FakeCommitmentRepository([
      makeCommitment(),
      makeCommitment({ title: "Estagio", startMinute: 13 * 60 + 30, durationMinutes: 360 }),
    ]);
    const source = new CommitmentBusySource(repository);

    const busy = await source.listBusy(
      USER_A,
      new Date("2025-11-03T03:00:00.000Z"),
      new Date("2025-11-04T03:00:00.000Z"),
      SAO_PAULO,
    );

    expect(busy.map((item) => item.start.toISOString())).toEqual([
      "2025-11-03T11:00:00.000Z",
      "2025-11-03T16:30:00.000Z",
    ]);
  });

  test("inclui ocorrencia que comecou antes do periodo e ainda nao terminou", async () => {
    const lateNight = makeCommitment({ startMinute: 23 * 60, durationMinutes: 120 });
    const source = new CommitmentBusySource(new FakeCommitmentRepository([lateNight]));

    const busy = await source.listBusy(
      USER_A,
      new Date("2025-11-04T03:00:00.000Z"),
      new Date("2025-11-04T04:00:00.000Z"),
      SAO_PAULO,
    );

    expect(busy).toEqual([
      {
        start: new Date("2025-11-04T02:00:00.000Z"),
        end: new Date("2025-11-04T04:00:00.000Z"),
      },
    ]);
  });

  test("posse: compromissos de A nao ocupam a agenda de B", async () => {
    const source = new CommitmentBusySource(new FakeCommitmentRepository([makeCommitment()]));

    const busy = await source.listBusy(
      USER_B,
      new Date("2025-11-03T03:00:00.000Z"),
      new Date("2025-11-10T03:00:00.000Z"),
      SAO_PAULO,
    );

    expect(busy).toEqual([]);
  });
});
