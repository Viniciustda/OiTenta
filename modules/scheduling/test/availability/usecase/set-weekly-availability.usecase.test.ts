import { ValidationException } from "@oitenta/shared";
import { SetWeeklyAvailability, WeeklyAvailability } from "../../../src";
import { FakeWeeklyAvailabilityRepository, makeAvailability, USER_A, USER_B } from "../../mock";

const THREE_WINDOWS = [
  { weekday: 0, startMinute: 1140, endMinute: 1380 },
  { weekday: 2, startMinute: 1140, endMinute: 1380 },
  { weekday: 4, startMinute: 480, endMinute: 720 },
];

describe("SetWeeklyAvailability", () => {
  test("cenario 1: usuario sem disponibilidade salva 3 janelas e limite 180", async () => {
    const repository = new FakeWeeklyAvailabilityRepository();
    const useCase = new SetWeeklyAvailability(repository);

    const output = await useCase.execute({
      userId: USER_A,
      windows: THREE_WINDOWS,
      dailyLimitMinutes: 180,
    });

    expect(output.availability.userId).toBe(USER_A);
    expect(output.availability.windows).toEqual(THREE_WINDOWS);
    expect(output.availability.dailyLimitMinutes).toBe(180);
    expect(await repository.findByUser(USER_A)).toBe(output.availability);
  });

  test("cenario 2: salvar de novo substitui (uma por usuario) e mantem o id", async () => {
    const existing = makeAvailability(USER_A, 120);
    const repository = new FakeWeeklyAvailabilityRepository([existing]);
    const useCase = new SetWeeklyAvailability(repository);

    const output = await useCase.execute({
      userId: USER_A,
      windows: THREE_WINDOWS,
      dailyLimitMinutes: 180,
    });

    expect(repository.all).toHaveLength(1);
    expect(output.availability.id).toBe(existing.id);
    expect(output.availability.dailyLimitMinutes).toBe(180);
  });

  test("une janelas encostadas do mesmo dia antes de salvar", async () => {
    const repository = new FakeWeeklyAvailabilityRepository();
    const useCase = new SetWeeklyAvailability(repository);

    const output = await useCase.execute({
      userId: USER_A,
      windows: [
        { weekday: 0, startMinute: 1200, endMinute: 1260 },
        { weekday: 0, startMinute: 1140, endMinute: 1200 },
      ],
      dailyLimitMinutes: 120,
    });

    expect(output.availability.windows).toEqual([{ weekday: 0, startMinute: 1140, endMinute: 1260 }]);
  });

  test("cenario 3: janelas invalidas lancam ValidationException e nao gravam", async () => {
    const repository = new FakeWeeklyAvailabilityRepository();
    const useCase = new SetWeeklyAvailability(repository);
    const validateSpy = jest.spyOn(WeeklyAvailability.prototype, "validate");

    await expect(
      useCase.execute({
        userId: USER_A,
        windows: [
          { weekday: 0, startMinute: 600, endMinute: 720 },
          { weekday: 0, startMinute: 690, endMinute: 780 },
        ],
        dailyLimitMinutes: 120,
      }),
    ).rejects.toThrow(ValidationException);

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(repository.saveCalls).toBe(0);
    validateSpy.mockRestore();
  });

  test("cenario 4 (posse): B salvar a dele nao muda a de A", async () => {
    const ofA = makeAvailability(USER_A, 120);
    const repository = new FakeWeeklyAvailabilityRepository([ofA]);
    const useCase = new SetWeeklyAvailability(repository);

    await useCase.execute({ userId: USER_B, windows: THREE_WINDOWS, dailyLimitMinutes: 180 });

    expect(await repository.findByUser(USER_A)).toBe(ofA);
    expect((await repository.findByUser(USER_B))?.dailyLimitMinutes).toBe(180);
  });
});
