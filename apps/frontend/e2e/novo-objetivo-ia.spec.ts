import { expect, test } from "@playwright/test";

// Tarefa 11 (web): novo objetivo pelo assistente (IA1), de ponta a ponta, contra o backend local real.
// O Playwright sobe o backend com AI_PROVIDER=rules e AI_FALLBACK=rules (IA6): o rascunho vem do motor de
// regras, determinístico e sem rede. Usuário próprio (cadastro e disponibilidade pela API), para não depender
// do usuário demo nem da ordem dos specs.
// entrar → Novo objetivo → texto → "Analisar com IA" → W30 preenchida → "Encaixar no meu calendário" →
// o objetivo no calendário e na trilha, com todas as etapas encaixadas.

const API = "http://localhost:4000";
const TZ = "America/Sao_Paulo";
const PASSWORD = "Senha@123";

const GOAL_TITLE = "Trabalho de Algoritmos";
// Modelo "assignment" do motor de regras (apps/backend/src/modules/goals/assistant/step-templates.ts).
const STEPS = [
  { title: "Ler o enunciado e listar requisitos", minutes: 30, label: "30 min" },
  { title: "Pesquisar e separar o material", minutes: 60, label: "1h" },
  { title: `Fazer a primeira versão de ${GOAL_TITLE}`, minutes: 120, label: "2h" },
  { title: "Revisar e completar", minutes: 60, label: "1h" },
  { title: "Formatar e enviar", minutes: 30, label: "30 min" },
];

/** Hoje (YYYY-MM-DD) no fuso do usuário. */
function localToday(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function addDays(ymd: string, days: number) {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * O texto de referência com a entrega em hoje + 14 dias (como o fluxo-principal), para o plano sempre caber:
 * com uma data fixa, perto dela os 300 min não cabem até prazo − 1. O parser do backend lê "dd/mm" como a
 * próxima ocorrência a partir de hoje, que com +14 dias é sempre a própria data.
 */
function referenceText(deadline: string) {
  const [, mm, dd] = deadline.split("-");
  return `Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega ${dd}/${mm}`;
}

test("novo objetivo com IA (motor de regras): texto → W30 preenchida → Encaixar → objetivo no calendário", async ({ page, request }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (e) => browserErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) browserErrors.push(`console: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) browserErrors.push(`http ${r.status()}: ${r.request().method()} ${r.url()}`);
  });

  const deadline = addDays(localToday(), 14);
  const email = `e2e.ia.${Date.now().toString(36)}@bora.app`;
  let token = "";

  await test.step("usuário próprio com disponibilidade (pela API)", async () => {
    const reg = await request.post(`${API}/auth/register`, { data: { name: "Ana Souza", email, password: PASSWORD, timezone: TZ } });
    expect(reg.status()).toBe(201);
    const login = await request.post(`${API}/auth/login`, { data: { email, password: PASSWORD } });
    expect(login.status()).toBe(200);
    token = ((await login.json()) as { token: string }).token;
    // Todo dia das 08:00 às 23:00: há horário livre até o prazo qualquer que seja a hora da execução.
    const windows = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, startMinute: 480, endMinute: 1380 }));
    const put = await request.put(`${API}/scheduling/availability`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { windows, dailyLimitMinutes: 180 },
    });
    expect(put.status()).toBe(200);
  });

  await test.step("entrar pela tela", async () => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
    // O nome acessível leva o glifo do ícone da seta ("Entrar "); o do demo continua com "direto como…".
    await page.getByRole("button", { name: /^Entrar\W*$/ }).click();
    await expect(page).toHaveURL(/\/hoje$/);
  });

  const dialog = page.getByRole("dialog", { name: "Novo objetivo" });

  await test.step("W27: escrever o objetivo e Analisar com IA", async () => {
    await page.getByRole("button", { name: "Novo objetivo" }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("O que você precisa entregar?").fill(referenceText(deadline));
    const draftResponse = page.waitForResponse((r) => new URL(r.url()).pathname === "/goals/assistant/draft" && r.request().method() === "POST");
    await dialog.getByRole("button", { name: "Analisar com IA" }).click();
    const res = await draftResponse;
    expect(res.status()).toBe(200);
    expect(((await res.json()) as { engine: string }).engine).toBe("rules");
  });

  await test.step("W30 preenchida pelo rascunho", async () => {
    await expect(dialog.getByText("Novo objetivo · 3 de 3")).toBeVisible();
    await expect(dialog.getByLabel("Objetivo", { exact: true })).toHaveValue(GOAL_TITLE);
    await expect(dialog.getByLabel("Entrega", { exact: true })).toHaveValue(deadline);
    await expect(dialog.getByText(`${STEPS.length} etapas · edite o que quiser`)).toBeVisible();
    await expect(dialog.getByText(/^Total\s*5h$/)).toBeVisible();
    for (let i = 0; i < STEPS.length; i++) {
      const input = dialog.getByLabel(`Etapa ${i + 1}`, { exact: true });
      await expect(input).toHaveValue(STEPS[i].title);
      // A linha da etapa: o tempo estimado pelo motor de regras.
      await expect(input.locator("xpath=..").getByText(STEPS[i].label, { exact: true })).toBeVisible();
    }
    await expect(dialog.getByLabel(`Etapa ${STEPS.length + 1}`, { exact: true })).toHaveCount(0);
  });

  await test.step("Encaixar no meu calendário: POST /goals com source 'ai'", async () => {
    const createRequest = page.waitForRequest((r) => new URL(r.url()).pathname === "/goals" && r.method() === "POST");
    const createResponse = page.waitForResponse((r) => new URL(r.url()).pathname === "/goals" && r.request().method() === "POST");
    await dialog.getByRole("button", { name: "Encaixar no meu calendário" }).click();
    const body = (await createRequest).postDataJSON() as {
      title: string;
      deadline: string;
      source: string;
      steps: { title: string; estimatedMinutes: number; aiEstimatedMinutes: number }[];
    };
    expect({ title: body.title, deadline: body.deadline, source: body.source, steps: body.steps.map((s) => [s.title, s.estimatedMinutes, s.aiEstimatedMinutes]) }).toEqual({
      title: GOAL_TITLE,
      deadline,
      source: "ai",
      steps: STEPS.map((s) => [s.title, s.minutes, s.minutes]),
    });
    expect((await createResponse).status()).toBe(201);
  });

  await test.step("o objetivo aparece no calendário", async () => {
    await expect(page).toHaveURL(/\/calendario$/);
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: new RegExp(`^${GOAL_TITLE} \\d+%`) })).toBeVisible();
  });

  await test.step("na lista de objetivos e na trilha, com as 5 etapas encaixadas", async () => {
    await page.getByRole("navigation").getByRole("button", { name: "Objetivos" }).click();
    await expect(page).toHaveURL(/\/objetivos$/);
    await page.getByRole("button", { name: new RegExp(GOAL_TITLE) }).click();
    await expect(page).toHaveURL(/\/objetivos\/[^/]+$/);
    await expect(page.getByText(`0/${STEPS.length} concluídas`)).toBeVisible();
    for (const s of STEPS) {
      // Cada etapa tem horário marcado no plano (nenhuma "Ainda sem horário").
      const row = page.getByText(s.title, { exact: true }).locator("xpath=parent::div");
      await expect(row).toContainText(new RegExp(`\\d{2}:\\d{2} · ${s.label}$`));
    }
    await expect(page.getByText(/Ainda sem horário/)).toHaveCount(0);
  });

  await test.step("gravado como objetivo da IA (GET /goals/:id)", async () => {
    const goalId = new URL(page.url()).pathname.split("/").pop();
    const res = await request.get(`${API}/goals/${goalId}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
    const detail = (await res.json()) as {
      goal: { title: string; deadline: string; source: string };
      steps: { order: number; title: string; estimatedMinutes: number; aiEstimatedMinutes: number | null }[];
    };
    const saved = [...detail.steps].sort((a, b) => a.order - b.order);
    expect({ ...detail.goal, steps: saved.map((s) => [s.title, s.estimatedMinutes, s.aiEstimatedMinutes]) }).toMatchObject({
      title: GOAL_TITLE,
      deadline,
      source: "ai",
      steps: STEPS.map((s) => [s.title, s.minutes, s.minutes]),
    });
  });

  expect(browserErrors, "erros no navegador (console, exceções e HTTP)").toEqual([]);
});
