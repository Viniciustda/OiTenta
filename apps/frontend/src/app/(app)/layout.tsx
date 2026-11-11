import AppShell from "@/modules/core/components/app-shell.component";

// Sidebar do web app para /hoje, /calendario e /objetivos/[id] (P24).
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
