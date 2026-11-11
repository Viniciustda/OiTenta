import { NotFoundError } from "@oitenta/shared";
import { GetBlock } from "../../../src";
import { FakeScheduledBlockRepository, makeBlock, USER_A, USER_B } from "../../mock";

describe("GetBlock", () => {
  test("dono pede o bloco -> recebe o bloco", async () => {
    const block = makeBlock();
    const useCase = new GetBlock(new FakeScheduledBlockRepository([block]));

    const output = await useCase.execute({ userId: USER_A, blockId: block.id });

    expect(output.block.id).toBe(block.id);
  });

  test("posse: B pede o bloco de A -> NotFoundError 'Bloco não encontrado.'", async () => {
    const block = makeBlock();
    const useCase = new GetBlock(new FakeScheduledBlockRepository([block]));

    await expect(useCase.execute({ userId: USER_B, blockId: block.id })).rejects.toThrow(
      new NotFoundError("Bloco não encontrado."),
    );
  });

  test("blockId inexistente -> NotFoundError", async () => {
    const useCase = new GetBlock(new FakeScheduledBlockRepository());

    await expect(
      useCase.execute({ userId: USER_A, blockId: "55555555-5555-4555-8555-555555555555" }),
    ).rejects.toThrow(NotFoundError);
  });
});
