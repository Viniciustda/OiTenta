import { Suspense } from "react";
import GoalTrailPage from "@/modules/goals/pages/goal-trail.page";

export default function ObjetivoRoutePage({ params }: PageProps<"/objetivos/[id]">) {
  return <Suspense>{params.then(({ id }) => <GoalTrailPage goalId={id} />)}</Suspense>;
}
