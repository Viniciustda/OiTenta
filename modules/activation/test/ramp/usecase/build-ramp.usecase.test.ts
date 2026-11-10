import { ValidationException } from "@oitenta/shared";
import { BuildRamp, GENERIC_MICRO_STEP } from "../../../src";
import { FakeRampOptionSource } from "../../mock";

const USER_A = "2f9c1b6e-8a4d-4c3e-9b1a-1d2e3f4a5b6c";

const MICRO_STEPS = [
  "Abra o arquivo do trabalho e escreva o título",
  "Liste 3 atores do sistema",
  "Copie o enunciado pro topo do arquivo",
];

function makeSut() {
  const optionSource = new FakeRampOptionSource();
  const useCase = new BuildRamp(optionSource);
  return { optionSource, useCase };
}

describe("BuildRamp", () => {
  // Cenario 1
  test("dado energia high e 3 micro-passos, monta 5 degraus em ordem, sugere micro e usa os 3 textos", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      userId: USER_A,
      energy: "high",
      availableTime: "30m",
      microSteps: MICRO_STEPS,
    });

    expect(output.steps.map((step) => step.kind)).toEqual([
      "warmup",
      "challenge",
      "micro",
      "focus",
      "log",
    ]);
    expect(output.suggested).toBe("micro");
    expect(output.steps[2].options.map((option) => option.title)).toEqual(
      MICRO_STEPS,
    );
    expect(output.steps[0].options).toHaveLength(5);
    expect(output.steps[1].options).toHaveLength(4);
    expect(output.steps[3].options).toHaveLength(4);
    expect(output.steps[4].options).toEqual([]);
  });

  // Cenario 2
  test("dado microSteps vazio, o micro-passo tem 1 opcao com o texto generico provisorio (P6)", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      userId: USER_A,
      energy: "low",
      availableTime: null,
      microSteps: [],
    });

    expect(output.suggested).toBe("warmup");
    expect(output.steps[2].options.map((option) => option.title)).toEqual([
      GENERIC_MICRO_STEP,
    ]);
  });

  // Cenario 3
  test("dado energia invalida, lanca ValidationException sem consultar a fonte", async () => {
    const { optionSource, useCase } = makeSut();

    await expect(
      useCase.execute({
        userId: USER_A,
        energy: "sleepy" as never,
        microSteps: [],
      }),
    ).rejects.toThrow(ValidationException);

    expect(optionSource.calls).toEqual([]);
  });

  test("dado energia ausente, lanca ValidationException", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({
        userId: USER_A,
        energy: undefined as never,
        microSteps: [],
      }),
    ).rejects.toThrow(ValidationException);
  });

  // Posse: as opcoes sao pedidas sempre para o userId da entrada (vindo do token)
  test("consulta a fonte de opcoes so com o userId da entrada", async () => {
    const { optionSource, useCase } = makeSut();

    await useCase.execute({
      userId: USER_A,
      energy: "electric",
      microSteps: MICRO_STEPS,
    });

    expect(optionSource.calls.map((call) => call.userId)).toEqual([
      USER_A,
      USER_A,
      USER_A,
      USER_A,
      USER_A,
    ]);
    expect(
      optionSource.calls.find((call) => call.stepKind === "micro")?.microSteps,
    ).toEqual(MICRO_STEPS);
  });
});
