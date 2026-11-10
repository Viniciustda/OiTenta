import { ValidationException } from "@oitenta/shared";
import { CreateGoal, CreateGoalIn, Goal } from "../../../src";
import { buildGoal, FakeGoalRepository } from "../../mock";

const USER_A = "3b241101-e2bb-4255-8caf-4136c566a962";
const USER_B = "0b8f9e2a-3f4b-4c1d-9e8f-7a6b5c4d3e2f";

const ALGORITHMS_STEPS = [
  { title: "Ler o enunciado e listar requisitos", estimatedMinutes: 30 },
  { title: "Revisar Bubble, Merge e Quick Sort", estimatedMinutes: 60 },
  { title: "Implementar Bubble Sort", estimatedMinutes: 45 },
  { title: "Implementar Merge Sort", estimatedMinutes: 90 },
  { title: "Implementar Quick Sort", estimatedMinutes: 90 },
  { title: "Rodar testes e medir os tempos", estimatedMinutes: 60 },
  { title: "Escrever o relatório com gráficos", estimatedMinutes: 120 },
];

function makeSut(goals: Goal[] = []) {
  const goalRepository = new FakeGoalRepository(goals);
  const useCase = new CreateGoal(goalRepository);
  return { goalRepository, useCase };
}

function makeInput(overrides: Partial<CreateGoalIn> = {}): CreateGoalIn {
  return {
    userId: USER_A,
    title: "Trabalho de Algoritmos",
    deadline: "2026-11-24",
    kind: "goal",
    steps: ALGORITHMS_STEPS,
    ...overrides,
  };
}

describe("CreateGoal", () => {
  test("cenario 0 (P4): com 2 ativos (cores 1 e 2) o novo recebe a cor 3", async () => {
    const { useCase } = makeSut([
      buildGoal({ userId: USER_A, colorIndex: 1 }),
      buildGoal({ userId: USER_A, colorIndex: 2 }),
      buildGoal({ userId: USER_B, colorIndex: 3 }),
    ]);

    const output = await useCase.execute(makeInput());

    expect(output.goal.colorIndex).toBe(3);
  });

  test("cenario 0 (P4): com 4 ativos (1-4) o proximo recebe a cor 1", async () => {
    const { useCase } = makeSut([1, 2, 3, 4].map((colorIndex) =>
      buildGoal({ userId: USER_A, colorIndex: colorIndex as 1 | 2 | 3 | 4 }),
    ));

    const output = await useCase.execute(makeInput());

    expect(output.goal.colorIndex).toBe(1);
  });

  test("cenario 0 (P4): objetivos concluidos nao contam; sem ativos a cor e 1", async () => {
    const { useCase } = makeSut([
      buildGoal({ userId: USER_A, colorIndex: 1, steps: [{ progressPct: 100 }] }),
    ]);

    const output = await useCase.execute(makeInput());

    expect(output.goal.colorIndex).toBe(1);
  });

  test("cenario 1: grava 1 objetivo com 7 etapas na ordem 1..7, 0% e ativo", async () => {
    const { goalRepository, useCase } = makeSut();

    const output = await useCase.execute(makeInput());

    expect(goalRepository.goals).toHaveLength(1);
    const saved = goalRepository.goals[0];
    expect(saved.steps.map((step) => step.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(saved.steps.map((step) => step.title)).toEqual(
      ALGORITHMS_STEPS.map((step) => step.title),
    );
    expect(saved.steps.reduce((sum, step) => sum + step.estimatedMinutes, 0)).toBe(495);
    expect(saved.steps.every((step) => step.progressPct === 0)).toBe(true);
    expect(saved.steps.every((step) => step.status === "pending")).toBe(true);
    expect(saved.steps.every((step) => step.goalId === saved.id)).toBe(true);
    expect(saved.status).toBe("active");
    expect(saved.source).toBe("manual");
    expect(output.goal).toMatchObject({
      id: saved.id,
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      kind: "goal",
      status: "active",
      progressPct: 0,
    });
    expect(output.goal.steps).toHaveLength(7);
    expect(output.goal.steps[0]).toEqual({
      id: saved.steps[0].id,
      order: 1,
      title: "Ler o enunciado e listar requisitos",
      estimatedMinutes: 30,
      aiEstimatedMinutes: null,
      progressPct: 0,
      status: "pending",
      microSteps: [],
      remainingMinutes: 30,
    });
  });

  test("cenario 2: kind single com 1 etapa grava", async () => {
    const { goalRepository, useCase } = makeSut();

    await useCase.execute(
      makeInput({
        kind: "single",
        deadline: undefined,
        steps: [{ title: "Lista de exercícios", estimatedMinutes: 45, microSteps: ["Abrir a lista"] }],
      }),
    );

    expect(goalRepository.goals).toHaveLength(1);
    expect(goalRepository.goals[0].kind).toBe("single");
    expect(goalRepository.goals[0].deadline).toBeNull();
    expect(goalRepository.goals[0].steps[0].microSteps).toEqual(["Abrir a lista"]);
  });

  test("cenario 3: titulo vazio lanca ValidationException e nao grava", async () => {
    const { goalRepository, useCase } = makeSut();

    await expect(useCase.execute(makeInput({ title: "   " }))).rejects.toThrow(
      ValidationException,
    );
    expect(goalRepository.createCalls).toBe(0);
    expect(goalRepository.goals).toEqual([]);
  });

  test("prazo vazio ou so com espacos lanca ValidationException e nao grava (P3)", async () => {
    const { goalRepository, useCase } = makeSut();

    await expect(useCase.execute(makeInput({ deadline: "" }))).rejects.toThrow(
      ValidationException,
    );
    await expect(useCase.execute(makeInput({ deadline: "   " }))).rejects.toThrow(
      ValidationException,
    );
    expect(goalRepository.createCalls).toBe(0);
    expect(goalRepository.goals).toEqual([]);
  });

  test("etapa invalida (20 min) lanca ValidationException e nao grava", async () => {
    const { goalRepository, useCase } = makeSut();

    await expect(
      useCase.execute(makeInput({ steps: [{ title: "Etapa", estimatedMinutes: 20 }] })),
    ).rejects.toThrow(ValidationException);
    expect(goalRepository.goals).toEqual([]);
  });

  test("cenario 4: o objetivo gravado pertence ao userId da entrada", async () => {
    const { goalRepository, useCase } = makeSut();

    await useCase.execute(makeInput({ userId: USER_B }));

    expect(goalRepository.goals[0].userId).toBe(USER_B);
  });

  test("deve tirar os espacos das pontas dos titulos (P2)", async () => {
    const { goalRepository, useCase } = makeSut();

    await useCase.execute(
      makeInput({ title: "  Portfólio  ", steps: [{ title: " Subir repo ", estimatedMinutes: 30 }] }),
    );

    expect(goalRepository.goals[0].title).toBe("Portfólio");
    expect(goalRepository.goals[0].steps[0].title).toBe("Subir repo");
  });
});
