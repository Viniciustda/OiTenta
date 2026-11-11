import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

// Etapa E (web): fluxo principal de ponta a ponta contra o backend local real (NEXT_PUBLIC_DATA_SOURCE=http).
// login demo → onboarding → novo objetivo → plano no Hoje e no calendário → rampa → registrar → plano recalculado.
// O relógio é o real: o prazo é relativo (hoje + 14 dias) e, se o dia corrente não tiver mais horário
// livre, a rampa abre pela trilha do objetivo ("Começar próxima etapa").

const TZ = "America/Sao_Paulo";
const GRID_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const LAST_GRID_HOUR = 22; // a grade vai de 08h a 23h (última célula 22h–23h)
const SHOTS = process.env.E2E_SHOTS_DIR ?? path.join(__dirname, "..", "test-results", "fluxo-principal");

function localNow(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23", weekday: "short" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday);
  return { ymd: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), weekday };
}

function addDays(ymd: string, days: number) {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// caret "initial": o padrão do Playwright esconde o cursor com um style inline, que o React acusa como
// hydration mismatch quando a captura acontece antes da hidratação.
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true, caret: "initial" });

// Único erro HTTP esperado: GET /scheduling/availability → 404 logo depois do login demo (sem
// disponibilidade, vai para o onboarding; P12).
const expectedFailure = (status: number, url: string) => status === 404 && new URL(url).pathname === "/scheduling/availability";

test("fluxo principal: login demo → onboarding → objetivo → plano → rampa → registro → plano recalculado", async ({ page }) => {
  test.setTimeout(120_000);
  // Erros do navegador (console e exceções não tratadas) também reprovam o fluxo.
  const browserErrors: string[] = [];
  page.on("pageerror", (e) => browserErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) browserErrors.push(`console: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !expectedFailure(r.status(), r.url())) browserErrors.push(`http ${r.status()}: ${r.request().method()} ${r.url()}`);
  });
  const now = localNow();
  const stamp = Date.now().toString(36);
  const goalTitle = `Trabalho E2E ${stamp}`;
  const steps = [`Ler o enunciado ${stamp}`, `Escrever o resumo ${stamp}`];
  const deadline = addDays(now.ymd, 14);
  // Horas livres de hoje a partir da hora atual (o plano começa em "agora").
  // E2E_SEM_BLOCO_HOJE=1 força o caminho sem bloco no dia (rampa aberta pela trilha do objetivo).
  const todayHours = process.env.E2E_SEM_BLOCO_HOJE === "1"
    ? []
    : Array.from({ length: Math.max(0, LAST_GRID_HOUR - Math.max(8, now.hour) + 1) }, (_, i) => Math.max(8, now.hour) + i);

  await test.step("login demo", async () => {
    await page.goto("/entrar");
    await shot(page, "01-entrar");
    await page.getByRole("button", { name: "Entrar direto como Arthur (demo)" }).click();
    await expect(page).toHaveURL(/\/onboarding$/);
  });

  await test.step("onboarding: horários livres e limite diário", async () => {
    await page.getByRole("button", { name: "Bora!" }).click();
    for (let d = 0; d < 7; d++) {
      const hours = d === now.weekday ? todayHours : [20, 21, 22];
      for (const h of hours) await page.getByTitle(`${GRID_DAYS[d]} ${h}h–${h + 1}h`, { exact: true }).click();
    }
    const total = 6 * 3 + todayHours.length;
    await expect(page.getByText(`Livre · ${total}h por semana`)).toBeVisible();
    await shot(page, "02-onboarding-grade");
    await page.getByRole("button", { name: "Pronto, esses são meus horários" }).click();

    const slider = page.getByRole("slider", { name: "Máximo por dia" });
    await expect(slider).toHaveAttribute("aria-valuenow", "180");
    await slider.focus();
    await slider.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "210");
    await shot(page, "03-onboarding-limite");
    await page.getByRole("button", { name: "Esse é meu limite" }).click();
    await expect(page.getByText("3h30 por dia", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Ir pro meu dia" }).click();
    await expect(page).toHaveURL(/\/hoje$/);
  });

  await test.step("novo objetivo com 2 etapas (W30 vazia) e Encaixar", async () => {
    await page.getByRole("button", { name: "Novo objetivo" }).click();
    const dialog = page.getByRole("dialog", { name: "Novo objetivo" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Objetivo", { exact: true }).fill(goalTitle);
    await dialog.getByLabel("Entrega", { exact: true }).fill(deadline);
    for (let i = 0; i < steps.length; i++) {
      await dialog.getByRole("button", { name: "Adicionar etapa" }).click();
      await dialog.getByLabel(`Etapa ${i + 1}`, { exact: true }).fill(steps[i]);
    }
    await expect(dialog.getByText("2 etapas · edite o que quiser")).toBeVisible();
    await shot(page, "04-novo-objetivo");
    await dialog.getByRole("button", { name: "Encaixar no meu calendário" }).click();
  });

  await test.step("o plano aparece no calendário", async () => {
    await expect(page).toHaveURL(/\/calendario$/);
    await expect(page.getByRole("button", { name: new RegExp(`^${goalTitle} \\d+%`) })).toBeVisible();
    // A semana corrente tem horário livre de hoje em diante (hoje e os dias seguintes até domingo).
    const weekHasRoom = todayHours.length > 0 || now.weekday < 6;
    if (weekHasRoom) {
      await expect(page.getByTitle(new RegExp(`^${goalTitle} · ${steps[0]} · `))).toBeVisible();
    } else {
      test.info().annotations.push({ type: "sem-bloco-na-semana", description: "domingo após 23h: os blocos ficam na semana seguinte" });
    }
    await shot(page, "05-calendario");
  });

  const blockToday = page.getByRole("button", { name: new RegExp(steps[0]) }).filter({ hasText: goalTitle });

  await test.step("o plano aparece no Hoje", async () => {
    await page.getByRole("navigation").getByRole("button", { name: "Hoje" }).click();
    await expect(page).toHaveURL(/\/hoje$/);
    const card = page.getByRole("button", { name: new RegExp(`^${goalTitle} \\d+%`) });
    await expect(card).toBeVisible();
    await expect(card).toContainText("0%");
    if (todayHours.length > 0) await expect(blockToday).toBeVisible();
    await shot(page, "06-hoje");
  });

  await test.step("rampa: check-in de energia e degrau", async () => {
    if (todayHours.length > 0) {
      await page.getByRole("button", { name: "Alta", exact: true }).click();
      await expect(page.getByRole("button", { name: "Alta", exact: true })).toHaveAttribute("aria-pressed", "true");
      await blockToday.click();
    } else {
      // Sem bloco hoje: abre pela trilha do objetivo. A energia não atravessa a navegação (ver relatório).
      await page.getByRole("button", { name: new RegExp(`^${goalTitle} \\d+%`) }).click();
      await page.getByRole("button", { name: "Começar próxima etapa" }).click();
    }
    const ramp = page.getByRole("dialog", { name: "Rampa até o foco" });
    await expect(ramp).toBeVisible();
    await expect(ramp.getByRole("heading", { name: steps[0] })).toBeVisible();
    if (todayHours.length > 0) await expect(ramp.getByText("Degrau 3 de 5 · Micro-passo")).toBeVisible();
    await shot(page, "07-rampa");
    // Sobe a rampa até o registro: conclui o degrau atual e termina o foco.
    const question = ramp.getByText(`Quanto você avançou em “${steps[0]}”?`);
    const finishFocus = ramp.getByRole("button", { name: "Terminar foco" });
    const finishStep = ramp.getByRole("button", { name: "Concluí o degrau" });
    for (let i = 0; i < 5; i++) {
      await expect(question.or(finishFocus).or(finishStep)).toBeVisible();
      if (await question.isVisible()) break;
      await (await finishFocus.isVisible() ? finishFocus : finishStep).click();
    }
    await expect(question).toBeVisible();
    await shot(page, "08-registrar");
  });

  await test.step("registrar Concluí", async () => {
    const ramp = page.getByRole("dialog", { name: "Rampa até o foco" });
    await ramp.getByRole("button", { name: /Concluí$/ }).click();
    await expect(ramp.getByText(`“${steps[0]}” concluída`)).toBeVisible();
    await expect(ramp.getByText(new RegExp(`${goalTitle} agora em [1-9]\\d*%`))).toBeVisible();
    await shot(page, "09-celebracao");
    await ramp.getByRole("button", { name: "Voltar pro meu dia" }).click();
    const milestone = page.getByRole("dialog", { name: "Conquista" });
    await milestone.getByRole("button", { name: "Bora!" }).click({ timeout: 5_000 }).catch(() => undefined);
    await expect(ramp).toBeHidden();
  });

  await test.step("plano recalculado", async () => {
    await page.goto("/hoje");
    const card = page.getByRole("button", { name: new RegExp(`^${goalTitle} \\d+%`) });
    await expect(card).toBeVisible();
    await expect(card).not.toContainText(/(^|\D)0%/);
    if (todayHours.length > 0) {
      // O bloco registrado fica como concluído (sem abrir a rampa de novo).
      await expect(blockToday).toContainText("Concluída");
    }
    await shot(page, "10-hoje-recalculado");
    await card.click();
    await expect(page).toHaveURL(/\/objetivos\//);
    await expect(page.getByText("1/2 concluídas")).toBeVisible();
    await shot(page, "11-trilha");
  });

  expect(browserErrors, "erros no navegador (console, exceções e HTTP)").toEqual([]);
});
