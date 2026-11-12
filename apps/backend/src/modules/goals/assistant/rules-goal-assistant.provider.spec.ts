import { ParseGoalIn, SuggestStepsIn } from '@oitenta/goals';
import { RulesGoalAssistantProvider } from './rules-goal-assistant.provider';

const TODAY = '2026-11-11';
const REFERENCE =
  'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11';

function parseIn(text: string): ParseGoalIn {
  return { text, today: TODAY, timezone: 'America/Sao_Paulo' };
}

function stepsIn(overrides: Partial<SuggestStepsIn> = {}): SuggestStepsIn {
  return {
    title: 'Trabalho de Algoritmos',
    deadline: '2026-11-24',
    category: 'assignment',
    requirements: [],
    text: REFERENCE,
    today: TODAY,
    ...overrides,
  };
}

describe('RulesGoalAssistantProvider', () => {
  const provider = new RulesGoalAssistantProvider();

  describe('parseGoal', () => {
    test('texto de referência (F §4)', async () => {
      await expect(provider.parseGoal(parseIn(REFERENCE))).resolves.toEqual({
        title: 'Trabalho de Algoritmos',
        deadline: '2026-11-24',
        category: 'assignment',
        requirements: [],
        missingFields: [],
        engine: 'rules',
      });
    });

    test('sem prazo → deadline null e missingFields ["deadline"]', async () => {
      const parsed = await provider.parseGoal(parseIn('Estudar para a prova'));
      expect({
        deadline: parsed.deadline,
        missingFields: parsed.missingFields,
      }).toEqual({ deadline: null, missingFields: ['deadline'] });
    });

    test('prazo impossível (31/02) → missingFields ["deadline"]', async () => {
      const parsed = await provider.parseGoal(parseIn('Lista 3, até 31/02'));
      expect(parsed.missingFields).toEqual(['deadline']);
    });

    describe('título', () => {
      test.each([
        ['Lista de Física – capítulos 3 e 4', 'Lista de Física'],
        ['Prova de Cálculo, dia 20', 'Prova de Cálculo'],
        ['TCC: escrever a introdução', 'TCC'],
        ['Relatório de Química. Entrega sexta', 'Relatório de Química'],
        ['Projeto do site\ncom 3 páginas', 'Projeto do site'],
        ['  Arrumar o quarto  ', 'Arrumar o quarto'],
        ['Ler o livro', 'Ler o livro'],
      ])('"%s" → "%s"', async (text, title) => {
        expect((await provider.parseGoal(parseIn(text))).title).toBe(title);
      });

      test('separador no início é ignorado: "— ler o livro" → "ler o livro"', async () => {
        expect((await provider.parseGoal(parseIn('— ler o livro'))).title).toBe(
          'ler o livro',
        );
      });

      test('separadores e espaços no início são ignorados antes de cortar', async () => {
        expect(
          (await provider.parseGoal(parseIn('  —, Prova de Cálculo, dia 20')))
            .title,
        ).toBe('Prova de Cálculo');
      });

      test('só pontuação → title null e missingFields com title', async () => {
        const parsed = await provider.parseGoal(parseIn('— ... !!! ?'));
        expect({
          title: parsed.title,
          missingFields: parsed.missingFields,
        }).toEqual({ title: null, missingFields: ['title', 'deadline'] });
      });

      test('título longo é cortado em 120 na última palavra inteira', async () => {
        const words = Array.from({ length: 30 }, (_, i) => `palavra${i}`);
        const text = words.join(' '); // ~260 caracteres, sem separador
        const title = (await provider.parseGoal(parseIn(text))).title!;
        expect({
          short: title.length <= 120,
          wholeWords: title.split(' ').every((w) => words.includes(w)),
          prefix: text.startsWith(title),
          nextIsSpace: text.charAt(title.length) === ' ',
        }).toEqual({
          short: true,
          wholeWords: true,
          prefix: true,
          nextIsSpace: true,
        });
      });

      test('título longo sem espaço → os 120 primeiros caracteres', async () => {
        const text = 'a'.repeat(150);
        expect((await provider.parseGoal(parseIn(text))).title).toBe(
          'a'.repeat(120),
        );
      });

      test('corte exatamente numa fronteira de palavra mantém 120', async () => {
        const text = `${'a'.repeat(120)} resto`;
        expect((await provider.parseGoal(parseIn(text))).title).toBe(
          'a'.repeat(120),
        );
      });

      test('separador no início e texto longo → o resto cortado em 120', async () => {
        const text = `, ${'b'.repeat(200)}`;
        expect((await provider.parseGoal(parseIn(text))).title).toBe(
          'b'.repeat(120),
        );
      });

      test('texto só com espaços → title null e missingFields com title', async () => {
        const parsed = await provider.parseGoal(parseIn('   '));
        expect({
          title: parsed.title,
          missingFields: parsed.missingFields,
        }).toEqual({ title: null, missingFields: ['title', 'deadline'] });
      });
    });

    describe('categoria', () => {
      test.each([
        ['Prova de Cálculo', 'exam'],
        ['Teste de inglês', 'exam'],
        ['Exame final', 'exam'],
        ['Estudar para a P1', 'exam'],
        ['Estudar para a p2 de física', 'exam'],
        ['Simulado do Enem', 'exam'],
        ['Trabalho de Algoritmos', 'assignment'],
        ['Relatório de Química', 'assignment'],
        ['Relatorio de Quimica', 'assignment'],
        ['Lista 3 de Física', 'assignment'],
        ['Entrega do resumo', 'assignment'],
        ['TP de redes', 'assignment'],
        ['Projeto de extensão', 'project'],
        ['Fazer um app de receitas', 'project'],
        ['Site da empresa júnior', 'project'],
        ['Montar o portfólio', 'project'],
        ['Montar o portfolio', 'project'],
        ['Escrever o TCC', 'project'],
        ['Arrumar o quarto', 'generic'],
      ])('"%s" → %s', async (text, category) => {
        expect((await provider.parseGoal(parseIn(text))).category).toBe(
          category,
        );
      });

      test('palavra só como parte de outra não conta ("aplicativo", "provavelmente", "sites")', async () => {
        expect(
          (
            await provider.parseGoal(
              parseIn('provavelmente revisar sites e aplicativos'),
            )
          ).category,
        ).toBe('generic');
      });

      test('mais de uma categoria: vale a palavra que aparece primeiro ("Projeto … prova")', async () => {
        expect(
          (await provider.parseGoal(parseIn('Projeto de física para a prova')))
            .category,
        ).toBe('project');
      });

      test('mais de uma categoria: vale a palavra que aparece primeiro ("Prova … trabalho")', async () => {
        expect(
          (await provider.parseGoal(parseIn('Prova de física e um trabalho')))
            .category,
        ).toBe('exam');
      });

      test('mais de uma categoria: vale a palavra que aparece primeiro ("lista … projeto")', async () => {
        expect(
          (
            await provider.parseGoal(
              parseIn('Fazer a lista do projeto antes do simulado'),
            )
          ).category,
        ).toBe('assignment');
      });
    });
  });

  describe('suggestSteps', () => {
    test('texto de referência: modelo assignment, 5 etapas, total 300', async () => {
      const result = await provider.suggestSteps(stepsIn());
      expect({
        engine: result.engine,
        count: result.steps.length,
        total: result.steps.reduce((sum, s) => sum + s.estimatedMinutes, 0),
        third: result.steps[2].title,
        firstMicroStep: result.steps[0].microSteps[0],
      }).toEqual({
        engine: 'rules',
        count: 5,
        total: 300,
        third: 'Fazer a primeira versão de Trabalho de Algoritmos',
        firstMicroStep: 'Abra o enunciado e copie os itens pedidos numa lista',
      });
    });

    test.each([
      ['assignment', 300],
      ['exam', 300],
      ['project', 300],
      ['generic', 180],
    ] as const)(
      '%s → total %i, sempre ≥ 1 etapa e minutos múltiplos de 15',
      async (category, total) => {
        const { steps } = await provider.suggestSteps(
          stepsIn({ category, title: 'Tema' }),
        );
        expect({
          atLeastOne: steps.length >= 1,
          multiples: steps.every((s) => s.estimatedMinutes % 15 === 0),
          total: steps.reduce((sum, s) => sum + s.estimatedMinutes, 0),
        }).toEqual({ atLeastOne: true, multiples: true, total });
      },
    );

    test('é determinístico (mesma entrada → mesma saída)', async () => {
      const a = await provider.suggestSteps(stepsIn());
      const b = await provider.suggestSteps(stepsIn());
      expect(a).toEqual(b);
    });
  });
});
