import { ListGoals } from "../../../src";
import { buildGoal, FakeGoalRepository } from "../../mock";

const USER_A = "3b241101-e2bb-4255-8caf-4136c566a962";
const USER_B = "0b8f9e2a-3f4b-4c1d-9e8f-7a6b5c4d3e2f";

describe("ListGoals", () => {
  test("cenario 1 (posse): A com 2 objetivos e B com 1 -> A recebe so os 2 dele", async () => {
    const a1 = buildGoal({ userId: USER_A, title: "A1" });
    const a2 = buildGoal({ userId: USER_A, title: "A2", colorIndex: 2 });
    const b1 = buildGoal({ userId: USER_B, title: "B1" });
    const useCase = new ListGoals(new FakeGoalRepository([a1, b1, a2]));

    const output = await useCase.execute({ userId: USER_A });

    expect(output.goals.map((goal) => goal.id).sort()).toEqual([a1.id, a2.id].sort());
    expect(output.goals.map((goal) => goal.id)).not.toContain(b1.id);
  });

  test("cenario 2: usuario sem objetivos recebe lista vazia", async () => {
    const useCase = new ListGoals(
      new FakeGoalRepository([buildGoal({ userId: USER_B })]),
    );

    const output = await useCase.execute({ userId: USER_A });

    expect(output.goals).toEqual([]);
  });

  test("cenario 3: 1 de 4 etapas iguais concluida -> 25%, done 1, total 4", async () => {
    const goal = buildGoal({
      userId: USER_A,
      deadline: null,
      colorIndex: 2,
      steps: [{ progressPct: 100 }, {}, {}, {}],
    });
    const useCase = new ListGoals(new FakeGoalRepository([goal]));

    const output = await useCase.execute({ userId: USER_A });

    expect(output.goals).toEqual([
      {
        id: goal.id,
        title: "Trabalho de Algoritmos",
        deadline: null,
        colorIndex: 2,
        progressPct: 25,
        done: 1,
        total: 4,
        status: "active",
      },
    ]);
  });
});
