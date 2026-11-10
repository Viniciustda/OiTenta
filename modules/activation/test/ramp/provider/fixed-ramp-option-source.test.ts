import {
  FixedRampOptionSource,
  GENERIC_MICRO_STEP,
  RampOptionSource,
} from "../../../src";

const USER_ID = "2f9c1b6e-8a4d-4c3e-9b1a-1d2e3f4a5b6c";

describe("FixedRampOptionSource", () => {
  const source: RampOptionSource = new FixedRampOptionSource();

  // Cenario 1
  test("warmup devolve as 5 opcoes do catalogo, na ordem do prototipo", async () => {
    const options = await source.listOptions(USER_ID, "warmup");

    expect(options).toEqual([
      {
        id: "warmup-1",
        stepKind: "warmup",
        title: "Alongamento de 3 min",
        durationLabel: "3 min",
        durationSeconds: 180,
        description: "Ombros, pescoço e braços. Sem sair da cadeira.",
        icon: "person-simple-walk",
        steps: [
          "Gire os ombros pra trás, devagar",
          "Incline a cabeça pra cada lado",
          "Estique os braços pro alto e solte o ar",
        ],
      },
      {
        id: "warmup-2",
        stepKind: "warmup",
        title: "Água e 5 respirações",
        durationLabel: "2 min",
        durationSeconds: 120,
        description: "Um copo d’água e respiração lenta.",
        icon: "drop",
        steps: [
          "Pegue um copo d’água",
          "Beba sem pressa",
          "Faça 5 respirações contando até 4",
        ],
      },
      {
        id: "warmup-3",
        stepKind: "warmup",
        title: "Arrumar a mesa",
        durationLabel: "3 min",
        durationSeconds: 180,
        description: "Deixa só o que você vai usar agora.",
        icon: "broom",
        steps: [
          "Tire da mesa o que não é do trabalho",
          "Deixe o notebook e um caderno",
          "Vire o celular pra baixo",
        ],
      },
      {
        id: "warmup-4",
        stepKind: "warmup",
        title: "Volta pela casa",
        durationLabel: "2 min",
        durationSeconds: 120,
        description: "Levanta, anda um pouco e volta.",
        icon: "person-simple-walk",
        steps: [
          "Levante da cadeira",
          "Ande até a janela ou a cozinha",
          "Volte e sente com os pés no chão",
        ],
      },
      {
        id: "warmup-5",
        stepKind: "warmup",
        title: "Tarefa leve de 5 min",
        durationLabel: "5 min",
        durationSeconds: 300,
        description: "Renomear os PDFs de Cálculo. Só isso.",
        icon: "broom",
        steps: [
          "Abra a pasta de Cálculo",
          "Renomeie os PDFs com o número da lista",
          "Feche a pasta e respire fundo",
        ],
      },
    ]);
  });

  // Cenario 2
  test("challenge devolve 4 opcoes, cada uma com as 5 contas do prototipo", async () => {
    const options = await source.listOptions(USER_ID, "challenge");

    expect(options).toEqual([
      {
        id: "challenge-1",
        stepKind: "challenge",
        title: "5 contas de soma",
        durationLabel: "2 min",
        description: "Tipo 17 + 26",
        icon: "calculator",
        operation: "+",
        problems: [
          { a: 17, b: 26, op: "+" },
          { a: 38, b: 15, op: "+" },
          { a: 54, b: 29, op: "+" },
          { a: 23, b: 48, op: "+" },
          { a: 66, b: 17, op: "+" },
        ],
      },
      {
        id: "challenge-2",
        stepKind: "challenge",
        title: "5 contas de subtração",
        durationLabel: "2 min",
        description: "Tipo 52 − 17",
        icon: "calculator",
        operation: "−",
        problems: [
          { a: 52, b: 17, op: "−" },
          { a: 81, b: 36, op: "−" },
          { a: 64, b: 28, op: "−" },
          { a: 93, b: 45, op: "−" },
          { a: 70, b: 23, op: "−" },
        ],
      },
      {
        id: "challenge-3",
        stepKind: "challenge",
        title: "5 contas de tabuada",
        durationLabel: "2 min",
        description: "Tipo 7 × 8",
        icon: "calculator",
        operation: "×",
        problems: [
          { a: 7, b: 8, op: "×" },
          { a: 6, b: 9, op: "×" },
          { a: 8, b: 4, op: "×" },
          { a: 9, b: 7, op: "×" },
          { a: 12, b: 6, op: "×" },
        ],
      },
      {
        id: "challenge-4",
        stepKind: "challenge",
        title: "5 contas misturadas",
        durationLabel: "2 min",
        description: "Soma, subtração e tabuada",
        icon: "calculator",
        operation: "mix",
        problems: [
          { a: 17, b: 26, op: "+" },
          { a: 64, b: 28, op: "−" },
          { a: 7, b: 8, op: "×" },
          { a: 38, b: 15, op: "+" },
          { a: 81, b: 36, op: "−" },
        ],
      },
    ]);
  });

  // Cenario 3
  test("focus devolve 4 opcoes, com 25 min primeiro", async () => {
    const options = await source.listOptions(USER_ID, "focus");

    expect(options).toEqual([
      {
        id: "focus-1",
        stepKind: "focus",
        title: "Foco de 25 min",
        durationLabel: "25 min",
        durationSeconds: 1500,
        description: "O padrão da rampa",
        icon: "timer",
      },
      {
        id: "focus-2",
        stepKind: "focus",
        title: "Foco de 15 min",
        durationLabel: "15 min",
        durationSeconds: 900,
        description: "Pra quando o tempo tá curto",
        icon: "timer",
      },
      {
        id: "focus-3",
        stepKind: "focus",
        title: "Foco de 10 min",
        durationLabel: "10 min",
        durationSeconds: 600,
        description: "Só pra destravar",
        icon: "timer",
      },
      {
        id: "focus-4",
        stepKind: "focus",
        title: "Foco de 45 min",
        durationLabel: "45 min",
        durationSeconds: 2700,
        description: "Se a energia tá alta",
        icon: "timer",
      },
    ]);
  });

  // Cenario 4
  test("log devolve lista vazia", async () => {
    await expect(source.listOptions(USER_ID, "log")).resolves.toEqual([]);
  });

  test("micro devolve uma opcao por micro-passo da etapa, na ordem", async () => {
    const options = await source.listOptions(USER_ID, "micro", [
      "Abra o arquivo do trabalho e escreva o título",
      "Liste 3 atores do sistema",
    ]);

    expect(options).toEqual([
      {
        id: "micro-1",
        stepKind: "micro",
        title: "Abra o arquivo do trabalho e escreva o título",
        durationLabel: "1 min",
        description: "Micro-passo",
        icon: "footprints",
      },
      {
        id: "micro-2",
        stepKind: "micro",
        title: "Liste 3 atores do sistema",
        durationLabel: "1 min",
        description: "Micro-passo",
        icon: "footprints",
      },
    ]);
  });

  test("micro sem micro-passos devolve 1 opcao com o texto generico (P6)", async () => {
    const options = await source.listOptions(USER_ID, "micro");

    expect(GENERIC_MICRO_STEP).toBe(
      "Abra o material desta etapa e faça só a primeira linha: o título ou a primeira frase.",
    );
    expect(options).toEqual([
      {
        id: "micro-1",
        stepKind: "micro",
        title: GENERIC_MICRO_STEP,
        durationLabel: "1 min",
        description: "Micro-passo",
        icon: "footprints",
      },
    ]);
  });

  test("devolve copias: alterar o retorno nao altera o catalogo", async () => {
    const first = await source.listOptions(USER_ID, "warmup");
    first[0].title = "alterado";
    first[0].steps?.push("extra");

    const second = await source.listOptions(USER_ID, "warmup");

    expect(second[0].title).toBe("Alongamento de 3 min");
    expect(second[0].steps).toHaveLength(3);
  });
});
