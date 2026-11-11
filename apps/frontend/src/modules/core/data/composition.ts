// Ponto único de composição dos repositórios do web: escolhe exemplo ou HTTP pela fonte de dados
// (NEXT_PUBLIC_DATA_SOURCE). Os index.ts de cada módulo reexportam as instâncias daqui.
import type { ActivationRepository } from "@/modules/activation/data/activation.repository";
import { ExampleActivationRepository } from "@/modules/activation/data/example-activation.repository";
import { HttpActivationRepository } from "@/modules/activation/data/http-activation.repository";
import type { AuthRepository } from "@/modules/auth/data/auth.repository";
import { ExampleAuthRepository } from "@/modules/auth/data/example-auth.repository";
import { HttpAuthRepository } from "@/modules/auth/data/http-auth.repository";
import { ExampleGoalsRepository } from "@/modules/goals/data/example-goals.repository";
import type { GoalsRepository } from "@/modules/goals/data/goals.repository";
import { HttpGoalsRepository } from "@/modules/goals/data/http-goals.repository";
import { ExampleSchedulingRepository } from "@/modules/scheduling/data/example-scheduling.repository";
import { HttpSchedulingRepository } from "@/modules/scheduling/data/http-scheduling.repository";
import type { SchedulingRepository } from "@/modules/scheduling/data/scheduling.repository";
import { type DataSource, DATA_SOURCE } from "./data-source";
import { HttpClient } from "./http-client";

export { createClock } from "./clock";
export { DATA_SOURCE, resolveDataSource, type DataSource } from "./data-source";

export interface Repositories {
  auth: AuthRepository;
  scheduling: SchedulingRepository;
  goals: GoalsRepository;
  activation: ActivationRepository;
}

export function createRepositories(source: DataSource, http: HttpClient = new HttpClient()): Repositories {
  if (source === "example") {
    return {
      auth: new ExampleAuthRepository(),
      scheduling: new ExampleSchedulingRepository(),
      goals: new ExampleGoalsRepository(),
      activation: new ExampleActivationRepository(),
    };
  }
  return {
    auth: new HttpAuthRepository(http),
    scheduling: new HttpSchedulingRepository(http),
    goals: new HttpGoalsRepository(http),
    activation: new HttpActivationRepository(http),
  };
}

export const repositories: Repositories = createRepositories(DATA_SOURCE);
