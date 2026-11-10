import { NotFoundError, ValidationException } from "@oitenta/shared";
import { BlockOutcome, RecordBlockOutcome } from "../../../src";
import { FakeScheduledBlockRepository, makeBlock, USER_A, USER_B } from "../../mock";

const OTHER_ID = "55555555-5555-4555-8555-555555555555";

function makeSut() {
  const block = makeBlock();
  const repository = new FakeScheduledBlockRepository([block]);
  return { block, repository, useCase: new RecordBlockOutcome(repository) };
}

describe("RecordBlockOutcome", () => {
  test("cenario 1: bloco planned registrado como done", async () => {
    const { block, repository, useCase } = makeSut();

    const output = await useCase.execute({ userId: USER_A, blockId: block.id, outcome: "done" });

    expect(output.block.status).toBe("done");
    expect(output.block.id).toBe(block.id);
    expect((await repository.findById(USER_A, block.id))?.status).toBe("done");
  });

  test("cenario 2: registrar missed", async () => {
    const { block, useCase } = makeSut();

    const output = await useCase.execute({ userId: USER_A, blockId: block.id, outcome: "missed" });

    expect(output.block.status).toBe("missed");
  });

  test("registrar partial", async () => {
    const { block, useCase } = makeSut();

    const output = await useCase.execute({ userId: USER_A, blockId: block.id, outcome: "partial" });

    expect(output.block.status).toBe("partial");
  });

  test("cenario 3 (posse): B registra o bloco de A -> NotFoundError e nada muda", async () => {
    const { block, repository, useCase } = makeSut();

    await expect(
      useCase.execute({ userId: USER_B, blockId: block.id, outcome: "done" }),
    ).rejects.toThrow(NotFoundError);
    expect(repository.writeCalls).toBe(0);
    expect((await repository.findById(USER_A, block.id))?.status).toBe("planned");
  });

  test("cenario 4: blockId inexistente -> NotFoundError", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ userId: USER_A, blockId: OTHER_ID, outcome: "done" }),
    ).rejects.toThrow(NotFoundError);
  });

  test("resultado fora da lista -> ValidationException e nada muda", async () => {
    const { block, repository, useCase } = makeSut();

    await expect(
      useCase.execute({ userId: USER_A, blockId: block.id, outcome: "planned" as BlockOutcome }),
    ).rejects.toThrow(ValidationException);
    expect(repository.writeCalls).toBe(0);
  });
});
