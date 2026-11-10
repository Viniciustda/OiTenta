export const USER_A = "11111111-1111-4111-8111-111111111111";
export const USER_B = "22222222-2222-4222-8222-222222222222";
export const GOAL_1 = "33333333-3333-4333-8333-333333333331";
export const GOAL_2 = "33333333-3333-4333-8333-333333333332";
export const GOAL_3 = "33333333-3333-4333-8333-333333333333";
export const GOAL_4 = "33333333-3333-4333-8333-333333333334";

export function stepId(n: number): string {
  return `44444444-4444-4444-8444-${String(n).padStart(12, "0")}`;
}

export const SAO_PAULO = "America/Sao_Paulo";
