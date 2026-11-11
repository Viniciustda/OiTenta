import { NotFoundError } from "@oitenta/shared";
import { GetWeeklyAvailability } from "../../../src";
import { FakeWeeklyAvailabilityRepository, makeAvailability, USER_A, USER_B } from "../../mock";

describe("GetWeeklyAvailability", () => {
  test("cenario 1: A salvou e recebe a dele", async () => {
    const ofA = makeAvailability(USER_A);
    const useCase = new GetWeeklyAvailability(new FakeWeeklyAvailabilityRepository([ofA]));

    const output = await useCase.execute({ userId: USER_A });

    expect(output.availability).toBe(ofA);
  });

  test("cenario 2: A nao salvou -> NotFoundError", async () => {
    const useCase = new GetWeeklyAvailability(new FakeWeeklyAvailabilityRepository());

    await expect(useCase.execute({ userId: USER_A })).rejects.toThrow(NotFoundError);
  });

  test("cenario 3 (posse): so A salvou e B pede -> NotFoundError", async () => {
    const useCase = new GetWeeklyAvailability(
      new FakeWeeklyAvailabilityRepository([makeAvailability(USER_A)]),
    );

    await expect(useCase.execute({ userId: USER_B })).rejects.toThrow(NotFoundError);
  });
});
