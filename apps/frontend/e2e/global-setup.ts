import { execSync } from "node:child_process";
import path from "node:path";

// Zera os dados do usuário demo (sessões, blocos, objetivos e disponibilidade) antes do e2e,
// para o login demo cair sempre no onboarding.
export default function globalSetup() {
  execSync("npm run db:reset-demo", { cwd: path.join(__dirname, "..", "..", "backend"), stdio: "inherit" });
}
