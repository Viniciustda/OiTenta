import { GOAL_CATEGORIES, GoalCategory } from '@oitenta/goals';
import {
  buildSteps,
  STEP_TEMPLATES,
  TOPIC_PLACEHOLDER,
} from './step-templates';

describe('STEP_TEMPLATES', () => {
  test('existe um modelo para cada categoria', () => {
    expect(Object.keys(STEP_TEMPLATES).sort()).toEqual(
      [...GOAL_CATEGORIES].sort(),
    );
  });

  test.each<[GoalCategory, number, number]>([
    ['assignment', 5, 300],
    ['exam', 5, 300],
    ['project', 5, 300],
    ['generic', 4, 180],
  ])('%s: %i etapas, total %i min', (category, count, total) => {
    const steps = buildSteps(category, 'Tema');
    expect({
      count: steps.length,
      total: steps.reduce((sum, s) => sum + s.estimatedMinutes, 0),
    }).toEqual({ count, total });
  });

  test.each([...GOAL_CATEGORIES])(
    '%s: minutos múltiplos de 15 e no mínimo 15',
    (category) => {
      const minutes = buildSteps(category, 'Tema').map(
        (s) => s.estimatedMinutes,
      );
      expect(minutes.every((m) => m >= 15 && m % 15 === 0)).toBe(true);
    },
  );

  test.each([...GOAL_CATEGORIES])(
    '%s: cada etapa tem 1 ou 2 micro-passos não vazios',
    (category) => {
      const ok = buildSteps(category, 'Tema').every(
        (s) =>
          s.microSteps.length >= 1 &&
          s.microSteps.length <= 2 &&
          s.microSteps.every((m) => m.trim().length > 0 && m.length <= 140),
      );
      expect(ok).toBe(true);
    },
  );

  test.each([...GOAL_CATEGORIES])(
    '%s: o <tema> aparece em exatamente uma etapa e é trocado pelo título',
    (category) => {
      const titles = buildSteps(category, 'Cálculo I').map((s) => s.title);
      expect({
        withTopic: titles.filter((t) => t.includes('Cálculo I')).length,
        placeholderLeft: titles.some((t) => t.includes(TOPIC_PLACEHOLDER)),
      }).toEqual({ withTopic: 1, placeholderLeft: false });
    },
  );

  test('assignment: etapas e minutos da tabela do §a.3', () => {
    expect(
      buildSteps('assignment', 'Trabalho de Algoritmos').map((s) => [
        s.title,
        s.estimatedMinutes,
      ]),
    ).toEqual([
      ['Ler o enunciado e listar requisitos', 30],
      ['Pesquisar e separar o material', 60],
      ['Fazer a primeira versão de Trabalho de Algoritmos', 120],
      ['Revisar e completar', 60],
      ['Formatar e enviar', 30],
    ]);
  });

  test('exam: etapas e minutos da tabela do §a.3', () => {
    expect(
      buildSteps('exam', 'Prova de Cálculo').map((s) => [
        s.title,
        s.estimatedMinutes,
      ]),
    ).toEqual([
      ['Listar os assuntos de Prova de Cálculo', 30],
      ['Revisar a teoria', 90],
      ['Resolver exercícios', 90],
      ['Fazer uma prova antiga ou simulado', 60],
      ['Revisar os erros', 30],
    ]);
  });

  test('project: etapas e minutos da tabela do §a.3', () => {
    expect(
      buildSteps('project', 'App de receitas').map((s) => [
        s.title,
        s.estimatedMinutes,
      ]),
    ).toEqual([
      ['Definir o escopo de App de receitas', 30],
      ['Montar a estrutura inicial', 60],
      ['Fazer a parte principal', 120],
      ['Testar e ajustar', 60],
      ['Publicar ou apresentar', 30],
    ]);
  });

  test('generic: etapas e minutos da tabela do §a.3', () => {
    expect(
      buildSteps('generic', 'Arrumar o quarto').map((s) => [
        s.title,
        s.estimatedMinutes,
      ]),
    ).toEqual([
      ['Entender o que precisa ser feito em Arrumar o quarto', 30],
      ['Fazer a primeira parte', 60],
      ['Fazer o restante', 60],
      ['Revisar e finalizar', 30],
    ]);
  });

  test('título com "$&" entra literal (sem padrão especial de replace)', () => {
    expect(buildSteps('generic', 'Plano $& custo')[0].title).toBe(
      'Entender o que precisa ser feito em Plano $& custo',
    );
  });

  test('categoria desconhecida em tempo de execução usa o modelo generic', () => {
    expect(
      buildSteps('homework' as GoalCategory, 'Tema').map((s) => s.title),
    ).toEqual(buildSteps('generic', 'Tema').map((s) => s.title));
  });

  test('os micro-passos devolvidos são cópias (alterar não muda o modelo)', () => {
    const first = buildSteps('assignment', 'Tema');
    first[0].microSteps.push('extra');
    expect(buildSteps('assignment', 'Tema')[0].microSteps).not.toContain(
      'extra',
    );
  });
});
