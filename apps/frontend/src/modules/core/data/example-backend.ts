// "Backend" em memória dos dados de exemplo (Etapa B). Guarda o estado que o backend real guardaria
// (usuários, grade, objetivos, blocos, sessões) e responde nas formas de docs/4-contrato-api.md.
// Os repositórios de exemplo de cada módulo delegam para cá; na Etapa D eles viram HTTP e este
// arquivo deixa de ser usado. Ele não calcula plano: blocos novos não são encaixados (ver relatório B4).
import type { CreateGoalInput, Goal, GoalStep } from "@/modules/goals/data/goals.types";
import type { BlockStatus, WeeklyAvailability } from "@/modules/scheduling/data/scheduling.types";
import type { FocusSession } from "@/modules/activation/data/activation.types";
import { badRequest, conflict, notFound, unauthorized, unprocessable } from "./api-error";
import type { PlanSummary } from "./plan-summary.types";
import {
  DEMO_AVAILABILITY,
  DEMO_BLOCKS,
  DEMO_GOALS,
  DEMO_USER,
  protoDate,
  saoPauloInstant,
} from "./example-data";

export interface ExampleUser {
  id: string;
  name: string;
  email: string;
  password: string;
  timezone: string;
}

export interface ExampleGoal extends Goal {
  short: string;
  slackDays: number | null;
  challenge: string | null;
  steps: GoalStep[];
}

export interface ExampleBlock {
  id: string;
  goalId: string;
  stepId: string;
  start: string;
  end: string;
  status: BlockStatus;
}

export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export class ExampleBackend {
  users: ExampleUser[] = [{ ...DEMO_USER }];
  sessionUserId: string | null = null;
  availability: WeeklyAvailability | null = null;
  goals: ExampleGoal[] = [];
  blocks: ExampleBlock[] = [];
  sessions: FocusSession[] = [];
  private seq = 0;

  constructor({ withDemoData = true }: { withDemoData?: boolean } = {}) {
    if (withDemoData) this.seedDemo();
  }

  nextId(prefix: string) {
    this.seq += 1;
    return `${prefix}-${this.seq}`;
  }

  private seedDemo() {
    this.availability = clone(DEMO_AVAILABILITY);
    this.goals = DEMO_GOALS.map((g) => ({
      id: g.id,
      title: g.title,
      short: g.short,
      deadline: g.deadline,
      kind: "goal",
      colorIndex: g.colorIndex,
      progressPct: g.progressPct,
      status: "active",
      slackDays: g.slackDays,
      challenge: g.challenge,
      steps: g.steps.map(([id, title, minutes, done], i) => ({
        id: `step-${id}`,
        order: i + 1,
        title,
        estimatedMinutes: minutes,
        progressPct: done ? 100 : 0,
        status: done ? "done" : "pending",
        microSteps: [],
      })),
    }));
    const parts: Record<string, number> = {};
    this.blocks = DEMO_BLOCKS.map(([day, minute, minutes, stepId]) => {
      const goal = this.goals.find((g) => g.steps.some((s) => s.id === `step-${stepId}`))!;
      const part = (parts[stepId] = (parts[stepId] ?? -1) + 1);
      const date = protoDate(day);
      return {
        id: `block-${stepId}-${part}`,
        goalId: goal.id,
        stepId: `step-${stepId}`,
        start: saoPauloInstant(date, minute),
        end: saoPauloInstant(date, minute + minutes),
        status: "planned",
      };
    });
  }

  // ---------- auth ----------
  currentUser(): ExampleUser {
    const u = this.users.find((x) => x.id === this.sessionUserId) ?? this.users.find((x) => x.id === DEMO_USER.id);
    if (!u) throw unauthorized();
    return u;
  }

  login(email: string, password: string) {
    const u = this.users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
    if (!u) throw unauthorized("E-mail ou senha inválidos");
    this.sessionUserId = u.id;
    return u;
  }

  register(name: string, email: string, password: string, timezone?: string) {
    const normalized = email.trim().toLowerCase();
    if (!name.trim() || !normalized || !password) throw badRequest("Nome, e-mail e senha são obrigatórios");
    if (this.users.some((x) => x.email === normalized)) throw conflict("E-mail já cadastrado");
    const u = { id: this.nextId("user"), name: name.trim(), email: normalized, password, timezone: timezone ?? "America/Sao_Paulo" };
    this.users.push(u);
    return u;
  }

  // ---------- plano ----------
  minutesOf(b: ExampleBlock) {
    return Math.round((new Date(b.end).getTime() - new Date(b.start).getTime()) / 60_000);
  }

  planSummary(): PlanSummary {
    const planned = this.blocks.filter((b) => b.status === "planned");
    return {
      totalMinutes: planned.reduce((a, b) => a + this.minutesOf(b), 0),
      days: new Set(planned.map((b) => b.start.slice(0, 10))).size,
      goals: this.goals.map((g) => ({
        goalId: g.id,
        feasible: g.slackDays == null || g.slackDays >= 0,
        usedSlack: (g.slackDays ?? 0) >= 1,
        slackDays: g.slackDays,
        unscheduledMinutes: 0,
      })),
    };
  }

  // ---------- objetivos ----------
  findGoal(goalId: string) {
    const g = this.goals.find((x) => x.id === goalId);
    if (!g) throw notFound("Objetivo não encontrado");
    return g;
  }

  recomputeProgress(g: ExampleGoal) {
    const total = g.steps.reduce((a, s) => a + s.estimatedMinutes, 0);
    const done = g.steps.reduce((a, s) => a + (s.estimatedMinutes * s.progressPct) / 100, 0);
    g.progressPct = total ? Math.floor((done / total) * 100) : 0;
    g.status = g.steps.every((s) => s.progressPct === 100) ? "done" : "active";
  }

  createGoal(input: CreateGoalInput): ExampleGoal {
    const errors: string[] = [];
    const title = (input.title ?? "").trim();
    if (!title) errors.push("goal.title.required");
    if (title.length > 120) errors.push("goal.title.max");
    if (!input.steps?.length) errors.push("goal.steps.required");
    if (input.kind === "single" && input.steps?.length !== 1) errors.push("goal.single.steps");
    input.steps?.forEach((s) => {
      const t = (s.title ?? "").trim();
      if (!t || t.length > 120) errors.push("step.title.invalid");
      if (!Number.isInteger(s.estimatedMinutes) || s.estimatedMinutes < 15 || s.estimatedMinutes % 15 !== 0)
        errors.push("step.estimatedMinutes.invalid");
    });
    if (errors.length) throw unprocessable(errors);
    if (!this.availability) throw notFound("Faça o onboarding antes de criar um objetivo");
    const active = this.goals.filter((g) => g.status === "active").length;
    const id = this.nextId("goal");
    const goal: ExampleGoal = {
      id,
      title,
      short: title,
      deadline: input.deadline ?? null,
      kind: input.kind,
      colorIndex: (active % 4) + 1,
      progressPct: 0,
      status: "active",
      slackDays: null,
      challenge: null,
      steps: input.steps.map((s, i) => ({
        id: this.nextId("step"),
        order: i + 1,
        title: s.title.trim(),
        estimatedMinutes: s.estimatedMinutes,
        progressPct: 0,
        status: "pending",
        microSteps: s.microSteps ?? [],
      })),
    };
    this.goals.push(goal);
    return goal;
  }

  // ---------- sessões ----------
  recordSession(input: Omit<FocusSession, "id">) {
    if (input.outcome === "partial" && (input.partialPct == null || input.partialPct < 1 || input.partialPct > 99))
      throw unprocessable(["session.partialPct.required"]);
    const goal = this.findGoal(input.goalId);
    const step = goal.steps.find((s) => s.id === input.stepId);
    if (!step) throw notFound("Etapa não encontrada");
    const block = input.blockId ? this.blocks.find((b) => b.id === input.blockId) : undefined;
    if (input.blockId && !block) throw notFound("Bloco não encontrado");
    const session: FocusSession = { ...input, id: this.nextId("session") };
    this.sessions.push(session);
    if (input.outcome === "done") {
      step.progressPct = 100;
      step.status = "done";
    } else if (input.outcome === "partial") {
      step.progressPct = input.partialPct!;
    }
    if (input.outcome !== "not_done") this.recomputeProgress(goal);
    if (block) block.status = input.outcome === "done" ? "done" : input.outcome === "partial" ? "partial" : "missed";
    return { session, step, goal };
  }
}

export const exampleBackend = new ExampleBackend();
