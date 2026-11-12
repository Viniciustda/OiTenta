// Modelos de etapas do motor de regras (docs/7-proposta-ia.md §a.3).
// Os textos podem ser trocados pelo time aqui, sem mexer em mais nada:
// minutos sempre múltiplos de 15 (P5) e 1–2 micro-passos por etapa.

import { GoalCategory, SuggestedStep } from '@oitenta/goals';

/** Trocado pelo título do objetivo no título da etapa. */
export const TOPIC_PLACEHOLDER = '<tema>';

export interface StepTemplate {
  title: string;
  estimatedMinutes: number;
  microSteps: readonly string[];
}

export const STEP_TEMPLATES: Readonly<
  Record<GoalCategory, readonly StepTemplate[]>
> = {
  assignment: [
    {
      title: 'Ler o enunciado e listar requisitos',
      estimatedMinutes: 30,
      microSteps: [
        'Abra o enunciado e copie os itens pedidos numa lista',
        'Marque o que ainda não ficou claro',
      ],
    },
    {
      title: 'Pesquisar e separar o material',
      estimatedMinutes: 60,
      microSteps: [
        'Separe as anotações e os slides da matéria',
        'Salve duas ou três fontes sobre o tema',
      ],
    },
    {
      title: `Fazer a primeira versão de ${TOPIC_PLACEHOLDER}`,
      estimatedMinutes: 120,
      microSteps: [
        'Comece pelo item mais fácil da lista',
        'Escreva um rascunho rápido, sem se preocupar com a forma',
      ],
    },
    {
      title: 'Revisar e completar',
      estimatedMinutes: 60,
      microSteps: [
        'Confira cada item da lista de requisitos',
        'Complete o que ficou faltando',
      ],
    },
    {
      title: 'Formatar e enviar',
      estimatedMinutes: 30,
      microSteps: [
        'Ajuste a formatação pedida no enunciado',
        'Envie e confirme que a entrega foi registrada',
      ],
    },
  ],
  exam: [
    {
      title: `Listar os assuntos de ${TOPIC_PLACEHOLDER}`,
      estimatedMinutes: 30,
      microSteps: [
        'Abra o plano de ensino e liste os assuntos da prova',
        'Marque os assuntos que você domina menos',
      ],
    },
    {
      title: 'Revisar a teoria',
      estimatedMinutes: 90,
      microSteps: [
        'Releia o resumo do primeiro assunto da lista',
        'Anote as fórmulas e definições principais',
      ],
    },
    {
      title: 'Resolver exercícios',
      estimatedMinutes: 90,
      microSteps: [
        'Escolha três exercícios do primeiro assunto',
        'Confira a resposta ao terminar cada um',
      ],
    },
    {
      title: 'Fazer uma prova antiga ou simulado',
      estimatedMinutes: 60,
      microSteps: [
        'Separe uma prova antiga ou um simulado',
        'Resolva com o tempo cronometrado',
      ],
    },
    {
      title: 'Revisar os erros',
      estimatedMinutes: 30,
      microSteps: [
        'Liste as questões que você errou',
        'Refaça uma delas sem consultar',
      ],
    },
  ],
  project: [
    {
      title: `Definir o escopo de ${TOPIC_PLACEHOLDER}`,
      estimatedMinutes: 30,
      microSteps: [
        'Escreva em uma frase o que o projeto precisa entregar',
        'Liste as funcionalidades obrigatórias',
      ],
    },
    {
      title: 'Montar a estrutura inicial',
      estimatedMinutes: 60,
      microSteps: [
        'Crie a pasta ou o repositório do projeto',
        'Monte o esqueleto das partes principais',
      ],
    },
    {
      title: 'Fazer a parte principal',
      estimatedMinutes: 120,
      microSteps: [
        'Comece pela funcionalidade mais importante',
        'Faça funcionar antes de deixar bonito',
      ],
    },
    {
      title: 'Testar e ajustar',
      estimatedMinutes: 60,
      microSteps: [
        'Teste cada funcionalidade da lista',
        'Anote e corrija os problemas encontrados',
      ],
    },
    {
      title: 'Publicar ou apresentar',
      estimatedMinutes: 30,
      microSteps: [
        'Publique o projeto ou prepare a apresentação',
        'Revise o que você vai mostrar',
      ],
    },
  ],
  generic: [
    {
      title: `Entender o que precisa ser feito em ${TOPIC_PLACEHOLDER}`,
      estimatedMinutes: 30,
      microSteps: [
        'Escreva em uma frase o resultado esperado',
        'Liste as partes do que precisa ser feito',
      ],
    },
    {
      title: 'Fazer a primeira parte',
      estimatedMinutes: 60,
      microSteps: ['Comece pela parte mais fácil da lista'],
    },
    {
      title: 'Fazer o restante',
      estimatedMinutes: 60,
      microSteps: ['Siga a lista e risque cada parte pronta'],
    },
    {
      title: 'Revisar e finalizar',
      estimatedMinutes: 30,
      microSteps: [
        'Confira se o resultado atende ao que foi pedido',
        'Faça os últimos ajustes',
      ],
    },
  ],
};

/**
 * Monta as etapas do modelo da categoria com o título do objetivo no lugar do
 * `<tema>`. Categoria desconhecida usa o modelo `generic`.
 */
export function buildSteps(
  category: GoalCategory,
  title: string,
): SuggestedStep[] {
  const template = STEP_TEMPLATES[category] ?? STEP_TEMPLATES.generic;
  return template.map((step) => ({
    // Função no replace: o título entra literal (sem padrões como "$&").
    title: step.title.replace(TOPIC_PLACEHOLDER, () => title),
    estimatedMinutes: step.estimatedMinutes,
    microSteps: [...step.microSteps],
  }));
}
