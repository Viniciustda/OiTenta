import {
  ChallengeProblem,
  GENERIC_MICRO_STEP,
  RampOption,
  RampStepKind,
} from "../model";
import { RampOptionSource } from "./ramp-option-source";

type CatalogOption = Omit<RampOption, "id" | "stepKind">;

const PROBLEMS: Record<"+" | "−" | "×" | "mix", ChallengeProblem[]> = {
  "+": [
    { a: 17, b: 26, op: "+" },
    { a: 38, b: 15, op: "+" },
    { a: 54, b: 29, op: "+" },
    { a: 23, b: 48, op: "+" },
    { a: 66, b: 17, op: "+" },
  ],
  "−": [
    { a: 52, b: 17, op: "−" },
    { a: 81, b: 36, op: "−" },
    { a: 64, b: 28, op: "−" },
    { a: 93, b: 45, op: "−" },
    { a: 70, b: 23, op: "−" },
  ],
  "×": [
    { a: 7, b: 8, op: "×" },
    { a: 6, b: 9, op: "×" },
    { a: 8, b: 4, op: "×" },
    { a: 9, b: 7, op: "×" },
    { a: 12, b: 6, op: "×" },
  ],
  mix: [
    { a: 17, b: 26, op: "+" },
    { a: 64, b: 28, op: "−" },
    { a: 7, b: 8, op: "×" },
    { a: 38, b: 15, op: "+" },
    { a: 81, b: 36, op: "−" },
  ],
};

const WARMUP: CatalogOption[] = [
  {
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
  // Texto literal do protótipo (P16), provisório até as tarefas leves (UC13).
  {
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
];

const CHALLENGE: CatalogOption[] = [
  {
    title: "5 contas de soma",
    durationLabel: "2 min",
    description: "Tipo 17 + 26",
    icon: "calculator",
    operation: "+",
    problems: PROBLEMS["+"],
  },
  {
    title: "5 contas de subtração",
    durationLabel: "2 min",
    description: "Tipo 52 − 17",
    icon: "calculator",
    operation: "−",
    problems: PROBLEMS["−"],
  },
  {
    title: "5 contas de tabuada",
    durationLabel: "2 min",
    description: "Tipo 7 × 8",
    icon: "calculator",
    operation: "×",
    problems: PROBLEMS["×"],
  },
  {
    title: "5 contas misturadas",
    durationLabel: "2 min",
    description: "Soma, subtração e tabuada",
    icon: "calculator",
    operation: "mix",
    problems: PROBLEMS.mix,
  },
];

const FOCUS: CatalogOption[] = [
  {
    title: "Foco de 25 min",
    durationLabel: "25 min",
    durationSeconds: 1500,
    description: "O padrão da rampa",
    icon: "timer",
  },
  {
    title: "Foco de 15 min",
    durationLabel: "15 min",
    durationSeconds: 900,
    description: "Pra quando o tempo tá curto",
    icon: "timer",
  },
  {
    title: "Foco de 10 min",
    durationLabel: "10 min",
    durationSeconds: 600,
    description: "Só pra destravar",
    icon: "timer",
  },
  {
    title: "Foco de 45 min",
    durationLabel: "45 min",
    durationSeconds: 2700,
    description: "Se a energia tá alta",
    icon: "timer",
  },
];

function microOptions(microSteps: string[]): CatalogOption[] {
  const texts = microSteps.length > 0 ? microSteps : [GENERIC_MICRO_STEP];

  return texts.map((text) => ({
    title: text,
    durationLabel: "1 min",
    description: "Micro-passo",
    icon: "footprints",
  }));
}

function copyOption(
  stepKind: RampStepKind,
  option: CatalogOption,
  index: number,
): RampOption {
  const copy: RampOption = { id: `${stepKind}-${index + 1}`, stepKind, ...option };

  if (option.steps) {
    copy.steps = [...option.steps];
  }

  if (option.problems) {
    copy.problems = option.problems.map((problem) => ({ ...problem }));
  }

  return copy;
}

export class FixedRampOptionSource implements RampOptionSource {
  async listOptions(
    _userId: string,
    stepKind: RampStepKind,
    microSteps: string[] = [],
  ): Promise<RampOption[]> {
    const catalog: Record<RampStepKind, CatalogOption[]> = {
      warmup: WARMUP,
      challenge: CHALLENGE,
      micro: microOptions(microSteps),
      focus: FOCUS,
      log: [],
    };

    return catalog[stepKind].map((option, index) =>
      copyOption(stepKind, option, index),
    );
  }
}
