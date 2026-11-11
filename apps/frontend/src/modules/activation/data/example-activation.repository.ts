import { badRequest, notFound } from "@/modules/core/data/api-error";
import { clone, ExampleBackend, exampleBackend } from "@/modules/core/data/example-backend";
import { RAMP_TEXTS } from "@/modules/core/data/example-data";
import type { ActivationRepository } from "./activation.repository";
import type { EnergyLevel, GetRampInput, RampOption, RampResponse, RampStepKind, RecordSessionInput, RecordSessionResponse } from "./activation.types";

/** Texto do micro-passo quando a etapa não tem micro-passos (P6, provisório). Cópia da constante do domínio. */
export const GENERIC_MICRO_STEP = "Abra o material desta etapa e faça só a primeira linha: o título ou a primeira frase.";

/** Energia → degrau sugerido (docs/0-fluxos.md §3; P14). */
export const SUGGESTED_STEP: Record<EnergyLevel, RampStepKind> = {
  low: "warmup",
  medium: "challenge",
  high: "micro",
  electric: "focus",
};

const option = (stepKind: RampStepKind, id: string, title: string, minutes: number, icon: string): RampOption => ({
  id, stepKind, title, durationLabel: `${minutes} min`, durationSeconds: minutes * 60, description: "", icon,
});

// Dados de exemplo (Etapa B): textos da rampa do protótipo web (ModalRampa.dc.html).
export class ExampleActivationRepository implements ActivationRepository {
  constructor(private readonly backend: ExampleBackend = exampleBackend) {}

  async getRamp({ goalId, stepId, energy }: GetRampInput): Promise<RampResponse> {
    if (!(energy in SUGGESTED_STEP)) throw badRequest("Energia inválida");
    const goal = this.backend.findGoal(goalId);
    const step = goal.steps.find((s) => s.id === stepId);
    if (!step) throw notFound("Etapa não encontrada");
    // Como no domínio (BuildRamp): os micro-passos da etapa ou, sem eles, o texto genérico (P6).
    const micro = step.microSteps.length ? step.microSteps : [GENERIC_MICRO_STEP];
    return clone({
      suggested: SUGGESTED_STEP[energy],
      steps: [
        { kind: "warmup", options: RAMP_TEXTS.warmup(goal.short).map((t, i) => option("warmup", `warmup-${i + 1}`, t, 3, "person-simple-walk")) },
        { kind: "challenge", options: [goal.challenge ?? RAMP_TEXTS.challengeDefault, RAMP_TEXTS.challengeAlt].map((t, i) => option("challenge", `challenge-${i + 1}`, t, 2, "calculator")) },
        { kind: "micro", options: micro.map((t, i) => option("micro", `micro-${i + 1}`, t, 1, "footprints")) },
        { kind: "focus", options: [option("focus", "focus-25", "25 min", 25, "timer")] },
        { kind: "log", options: [] },
      ],
    });
  }

  async recordSession(input: RecordSessionInput): Promise<RecordSessionResponse> {
    const { session, step, goal } = this.backend.recordSession(input);
    return clone({
      session,
      step: { progressPct: step.progressPct, status: step.status === "done" ? "done" : "pending" },
      goalProgressPct: goal.progressPct,
      plan: this.backend.planSummary(),
    });
  }
}
