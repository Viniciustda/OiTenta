import { Commitment, CommitmentState, RecurrenceExpander } from "../../../src";
import { SAO_PAULO, USER_A } from "../../mock";

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

const expander = new RecurrenceExpander();

describe("RecurrenceExpander", () => {
  test("cenario 1: aula seg-sex expandida de 03/11 a 09/11 da 5 ocorrencias, nenhuma no fim de semana", () => {
    const occurrences = expander.expand(makeCommitment(), "2025-11-03", "2025-11-09", SAO_PAULO);

    expect(occurrences.map((item) => item.start.toISOString())).toEqual([
      "2025-11-03T11:00:00.000Z",
      "2025-11-04T11:00:00.000Z",
      "2025-11-05T11:00:00.000Z",
      "2025-11-06T11:00:00.000Z",
      "2025-11-07T11:00:00.000Z",
    ]);
  });

  test("cenario 2: endDate 05/11 limita a semana a 3 ocorrencias", () => {
    const commitment = makeCommitment({
      recurrence: { weekdays: [0, 1, 2, 3, 4], endDate: "2025-11-05" },
    });

    expect(expander.expand(commitment, "2025-11-03", "2025-11-09", SAO_PAULO)).toHaveLength(3);
  });

  test("cenario 3: compromisso unico em 06/11 aparece 1 vez na semana que o contem", () => {
    const commitment = makeCommitment({ startDate: "2025-11-06", recurrence: null });

    expect(expander.expand(commitment, "2025-11-03", "2025-11-09", SAO_PAULO)).toHaveLength(1);
  });

  test("cenario 3: compromisso unico em 06/11 nao aparece em outra semana", () => {
    const commitment = makeCommitment({ startDate: "2025-11-06", recurrence: null });

    expect(expander.expand(commitment, "2025-11-10", "2025-11-16", SAO_PAULO)).toEqual([]);
  });

  test("cenario 4: 08:00 em Sao Paulo comeca 11:00 UTC e termina apos a duracao", () => {
    const [first] = expander.expand(makeCommitment(), "2025-11-03", "2025-11-03", SAO_PAULO);

    expect(first?.start.toISOString()).toBe("2025-11-03T11:00:00.000Z");
    expect(first?.end.toISOString()).toBe("2025-11-03T15:00:00.000Z");
  });

  test("respeita o startDate: nada antes do inicio do compromisso", () => {
    const commitment = makeCommitment({ startDate: "2025-11-05" });

    expect(expander.expand(commitment, "2025-11-03", "2025-11-09", SAO_PAULO)).toHaveLength(3);
  });
});
