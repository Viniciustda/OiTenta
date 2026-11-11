import AppShell from "@/modules/core/components/app-shell.component";

// Sidebar do web app para /hoje, /calendario, /objetivos, /objetivos/[id], /jardim e /configuracoes (P24).
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
