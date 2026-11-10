import { Suspense } from "react";
import TodayPage from "@/modules/today/pages/today.page";

// A rampa e o novo objetivo abrem como modais sobre o Hoje (P24), via ?goal=&step=&block= ou ?novo=1.
export default function HojeRoutePage() {
  return (
    <Suspense>
      <TodayPage />
    </Suspense>
  );
}
