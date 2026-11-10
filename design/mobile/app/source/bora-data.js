(function () {
  const INK = '#0E1F1A';
  const BP = {
    body: 'M60 46 C84 46 94 68 94 82 C94 100 79 108 60 108 C41 108 26 100 26 82 C26 68 36 46 60 46 Z',
    belly: 'M27 90 C33 103 47 108 60 108 C78 108 91 101 93 88 C83 100 46 104 27 90 Z',
    shine: 'M44 59 C44 59 39 65 39 68.5 A5 5 0 0 0 49 68.5 C49 65 44 59 44 59 Z',
    leaf: 'M60 36 C60 24 70 17 83 19 C81 32 71 38 60 36 Z',
    vein: 'M63 33 C67 29 73 25 79 22',
  };

  // Broto — geometria exata do DS (seção 6). h = React.createElement
  function Broto(h, mood, size, o) {
    o = o || {};
    const ln = (k, d, c, w, x) => h('path', { key: k, d, fill: 'none', style: Object.assign({ stroke: c, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }, x || {}) });
    const el = (t, k, a) => h(t, Object.assign({ key: k }, a));
    const eye = (k, cx, cy, rx, ry) => el('ellipse', k, { cx, cy, rx, ry, fill: INK });
    const droop = mood === 'sono' || mood === 'murcho';
    const wilt = mood === 'murcho';
    const p = [
      ln('stem', 'M60 47 L60 36', '#047857', 3.5),
      h('g', { key: 'leaf', transform: droop ? 'rotate(38 60 36)' : undefined }, el('path', 'l', { d: BP.leaf, fill: wilt ? '#9AD7BB' : '#34D399' }), ln('v', BP.vein, '#047857', 1.6, { opacity: .5 })),
      el('path', 'b', { d: BP.body, fill: wilt ? '#6DBE9B' : '#10B981' }),
      el('path', 's', { d: BP.belly, fill: wilt ? '#4FA27F' : '#059669' }),
      el('path', 'g', { d: BP.shine, fill: '#BAE6FD' }),
    ];
    const x = [];
    if (mood === 'ok') p.push(eye('e1', 50, 82, 4, 5.5), eye('e2', 70, 82, 4, 5.5), ln('m', 'M57 92.5 Q60 95 63 92.5', INK, 2.2));
    else if (mood === 'sono') {
      p.push(ln('e1', 'M45.5 83 Q50 86.5 54.5 83', INK, 2.6), ln('e2', 'M65.5 83 Q70 86.5 74.5 83', INK, 2.6), el('circle', 'm', { cx: 60, cy: 94, r: 1.8, fill: INK }));
      x.push(h('text', { key: 'z1', x: 88, y: 58, fill: '#4A5D57', style: { font: "700 14px 'Fredoka', sans-serif" } }, 'z'), h('text', { key: 'z2', x: 98, y: 46, fill: '#4A5D57', style: { font: "700 10px 'Fredoka', sans-serif" } }, 'z'));
    } else if (mood === 'animado') {
      p.push(eye('e1', 50, 82, 4.6, 6.2), eye('e2', 70, 82, 4.6, 6.2), el('circle', 'h1', { cx: 51.6, cy: 79.4, r: 1.7, fill: '#FFFFFF' }), el('circle', 'h2', { cx: 71.6, cy: 79.4, r: 1.7, fill: '#FFFFFF' }), el('path', 'm', { d: 'M55.5 90.5 Q60 97.5 64.5 90.5 Z', fill: INK }));
      x.push(ln('s1', 'M100 45 L100 55 M95 50 L105 50', '#0EA5E9', 2.6), ln('s2', 'M18 59 L18 67 M14 63 L22 63', '#0EA5E9', 2.6));
    } else if (mood === 'murcho') {
      p.push(eye('e1', 50, 84, 3.6, 3.4), eye('e2', 70, 84, 3.6, 3.4), ln('m', 'M56.5 95 Q60 92.5 63.5 95', INK, 2.6));
    } else if (mood === 'eletrico') {
      p.push(eye('e1', 50, 82, 4.6, 6.2), eye('e2', 70, 82, 4.6, 6.2), el('circle', 'h1', { cx: 51.6, cy: 79.4, r: 1.7, fill: '#FFFFFF' }), el('circle', 'h2', { cx: 71.6, cy: 79.4, r: 1.7, fill: '#FFFFFF' }), el('path', 'm', { d: 'M55 90 Q60 98.5 65 90 Z', fill: INK }));
      x.push(ln('s1', 'M100 45 L100 55 M95 50 L105 50', '#0EA5E9', 2.6), ln('s2', 'M18 59 L18 67 M14 63 L22 63', '#0EA5E9', 2.6), ln('s3', 'M104 74 L104 80 M101 77 L107 77', '#0EA5E9', 2.2), ln('s4', 'M26 34 L26 40 M23 37 L29 37', '#0EA5E9', 2.2));
    } else if (mood === 'focado') {
      const gl = { stroke: INK, strokeWidth: 2.4 };
      p.push(eye('e1', 50, 83, 3.2, 4.2), eye('e2', 70, 83, 3.2, 4.2), ln('m', 'M57 95 L63 95', INK, 2.6),
        el('circle', 'g1', { cx: 50, cy: 82, r: 8.5, fill: 'rgba(255,255,255,.3)', style: gl }),
        el('circle', 'g2', { cx: 70, cy: 82, r: 8.5, fill: 'rgba(255,255,255,.3)', style: gl }),
        ln('br', 'M58.5 81 Q60 79.5 61.5 81', INK, 2.4));
    } else if (mood === 'preocupado') {
      p.push(eye('e1', 50, 83, 3.8, 5.2), eye('e2', 70, 83, 3.8, 5.2), ln('m', 'M55 95 Q57.5 93 60 95 Q62.5 97 65 95', INK, 2.6),
        ln('b1', 'M44 74 L54 71', INK, 2.6), ln('b2', 'M66 71 L76 74', INK, 2.6),
        el('path', 'sw', { d: 'M93 62 C93 62 88.5 68 88.5 70.5 A4.5 4.5 0 0 0 97.5 70.5 C97.5 68 93 62 93 62 Z', fill: '#0EA5E9' }));
    } else if (mood === 'comemora') {
      p.push(ln('e1', 'M45.5 84 Q50 78 54.5 84', INK, 2.8), ln('e2', 'M65.5 84 Q70 78 74.5 84', INK, 2.8), el('path', 'm', { d: 'M55 90 Q60 98.5 65 90 Z', fill: INK }));
      [[22, 40, '#F59E0B', -20], [98, 36, '#0EA5E9', 25], [12, 76, '#34D399', 40], [106, 72, '#F59E0B', -35], [36, 22, '#34D399', 15], [86, 16, '#0EA5E9', -15]]
        .forEach((c, i) => x.push(el('rect', 'c' + i, { x: c[0] - 3.5, y: c[1] - 2, width: 7, height: 4, rx: 1.5, fill: c[2], transform: `rotate(${c[3]} ${c[0]} ${c[1]})` })));
    }
    const lift = (mood === 'animado' || mood === 'comemora' || mood === 'eletrico') ? 'translate(0 -4)' : undefined;
    const inner = o.anim
      ? h('g', { key: 'plant', transform: lift }, h('g', { style: { animation: o.anim, transformOrigin: '60px 108px' } }, p))
      : h('g', { key: 'plant', transform: lift }, p);
    const kids = [el('ellipse', 'sh', { cx: 60, cy: 112, rx: 30, ry: 4, fill: 'rgba(14,31,26,.10)' }), inner].concat(x);
    if (o.drop) kids.push(el('path', 'drop', { d: 'M74 6 C74 6 68 14 68 18 A6 6 0 0 0 80 18 C80 14 74 6 74 6 Z', fill: '#0EA5E9', style: { animation: 'boraDrop 1.1s ease-in both' } }));
    return h('svg', { width: size, height: size, viewBox: '0 0 120 120', style: { overflow: 'visible', flexShrink: 0, display: 'block' } }, kids);
  }

  const STEPS = [
    { kind: 'aquecer', name: 'Aquecer', full: 'Aquecer', icon: 'person-simple-walk', screen: 'aquecer' },
    { kind: 'desafio', name: 'Desafio', full: 'Desafio mental', icon: 'calculator', screen: 'desafio' },
    { kind: 'micro', name: 'Micro-passo', full: 'Micro-passo', icon: 'footprints', screen: 'micro' },
    { kind: 'foco', name: 'Foco', full: 'Foco', icon: 'timer', screen: 'foco' },
    { kind: 'registrar', name: 'Registrar', full: 'Registrar', icon: 'check-circle', screen: 'registro' },
  ];

  const ALTS = {
    aquecer: [
      { t: 'Alongamento de 3 min', d: '3 min', s: 180, desc: 'Ombros, pescoço e braços. Sem sair da cadeira.', icon: 'person-simple-walk', steps: ['Gire os ombros pra trás, devagar', 'Incline a cabeça pra cada lado', 'Estique os braços pro alto e solte o ar'] },
      { t: 'Água e 5 respirações', d: '2 min', s: 120, desc: 'Um copo d’água e respiração lenta.', icon: 'drop', steps: ['Pegue um copo d’água', 'Beba sem pressa', 'Faça 5 respirações contando até 4'] },
      { t: 'Arrumar a mesa', d: '3 min', s: 180, desc: 'Deixa só o que você vai usar agora.', icon: 'broom', steps: ['Tire da mesa o que não é do trabalho', 'Deixe o notebook e um caderno', 'Vire o celular pra baixo'] },
      { t: 'Volta pela casa', d: '2 min', s: 120, desc: 'Levanta, anda um pouco e volta.', icon: 'person-simple-walk', steps: ['Levante da cadeira', 'Ande até a janela ou a cozinha', 'Volte e sente com os pés no chão'] },
      { t: 'Tarefa leve de 5 min', d: '5 min', s: 300, desc: 'Renomear os PDFs de Cálculo. Só isso.', icon: 'broom', steps: ['Abra a pasta de Cálculo', 'Renomeie os PDFs com o número da lista', 'Feche a pasta e respire fundo'] },
    ],
    desafio: [
      { t: '5 contas de soma', d: '2 min', op: '+', desc: 'Tipo 17 + 26', icon: 'calculator' },
      { t: '5 contas de subtração', d: '2 min', op: '−', desc: 'Tipo 52 − 17', icon: 'calculator' },
      { t: '5 contas de tabuada', d: '2 min', op: '×', desc: 'Tipo 7 × 8', icon: 'calculator' },
      { t: '5 contas misturadas', d: '2 min', op: 'mix', desc: 'Soma, subtração e tabuada', icon: 'calculator' },
    ],
    foco: [
      { t: 'Foco de 25 min', d: '25 min', min: 25, desc: 'O padrão da rampa', icon: 'timer' },
      { t: 'Foco de 15 min', d: '15 min', min: 15, desc: 'Pra quando o tempo tá curto', icon: 'timer' },
      { t: 'Foco de 10 min', d: '10 min', min: 10, desc: 'Só pra destravar', icon: 'timer' },
      { t: 'Foco de 45 min', d: '45 min', min: 45, desc: 'Se a energia tá alta', icon: 'timer' },
    ],
  };

  const PROBS = {
    '+': [[17, 26, '+'], [38, 15, '+'], [54, 29, '+'], [23, 48, '+'], [66, 17, '+']],
    '−': [[52, 17, '−'], [81, 36, '−'], [64, 28, '−'], [93, 45, '−'], [70, 23, '−']],
    '×': [[7, 8, '×'], [6, 9, '×'], [8, 4, '×'], [9, 7, '×'], [12, 6, '×']],
    mix: [[17, 26, '+'], [64, 28, '−'], [7, 8, '×'], [38, 15, '+'], [81, 36, '−']],
  };

  const ETAPAS = [
    { obj: 'Eng. de Software', o: 1, title: 'Diagrama de casos de uso', time: '10:00', s: 10, d: 1.5, dur: '1h30',
      micro: ['Abra o arquivo do trabalho e escreva o título', 'Liste 3 atores do sistema', 'Copie o enunciado pro topo do arquivo', 'Desenhe só o retângulo do sistema'] },
    { obj: 'Cálculo II', o: 2, title: 'Lista 3: integrais por partes', time: '14:00', s: 14, d: 1, dur: '1h',
      micro: ['Abra a Lista 3 e leia a questão 1', 'Escreva a fórmula da integração por partes', 'Separe caderno, lápis e calculadora', 'Copie o enunciado da questão 1'] },
    { obj: 'Portfólio no GitHub', o: 3, title: 'README do projeto de Compiladores', time: '19:00', s: 19, d: .75, dur: '45 min',
      micro: ['Abra o repositório e crie o README.md', 'Escreva o nome do projeto e uma frase', 'Tire um print do projeto rodando', 'Liste 3 tecnologias que você usou'] },
  ];

  const LEVES = [
    { id: 'grupo', t: 'Responder o grupo do trabalho', m: 10, d: '10 min · ideal p/ energia baixa' },
    { id: 'material', t: 'Separar o material da prova', m: 15, d: '15 min · bom entre etapas' },
    { id: 'renomear', t: 'Renomear os PDFs de Cálculo', m: 5, d: '5 min' },
    { id: 'lista4', t: 'Baixar o enunciado da Lista 4', m: 5, d: '5 min' },
    { id: 'links', t: 'Salvar os links das aulas gravadas', m: 10, d: '10 min' },
    { id: 'branches', t: 'Apagar branches velhas no GitHub', m: 10, d: '10 min' },
  ];

  const OBJ = {
    0: { name: 'Tarefa avulsa', color: 'var(--tx2)', ink: 'var(--tx)' },
    1: { name: 'Eng. de Software', color: 'var(--obj1)', ink: 'var(--pri)' },
    2: { name: 'Cálculo II', color: 'var(--obj2)', ink: 'var(--blue)' },
    3: { name: 'Portfólio no GitHub', color: 'var(--obj3)', ink: 'var(--tx)' },
    4: { name: 'Algoritmos', color: 'var(--obj4)', ink: 'var(--pri)' },
  };

  const WEEK = [
    [{ s: 10, d: 2, o: 1, t: 'Levantar requisitos', st: 'done' }, { s: 14, d: 1.5, o: 2, t: 'Lista 2: substituição', st: 'done' }],
    [{ s: 9, d: 1.5, o: 1, t: 'Casos de uso: atores', st: 'done' }, { s: 19, d: 1, o: 3, t: 'Escolher os projetos', st: 'done' }],
    [{ s: 10, d: 1, o: 1, t: 'Diagrama de casos de uso', st: 'done' }, { s: 15, d: 1, o: 2, t: 'Revisar integrais', st: 'done' }],
    [],
    [{ s: 10, d: 2, o: 1, t: 'Diagrama de classes' }, { s: 16, d: 1.5, o: 2, t: 'Lista 3: questões 6 a 10' }],
    [{ s: 10, d: 2, o: 2, t: 'Resumo de técnicas de integração' }, { s: 15, d: 1.5, o: 1, t: 'Protótipo das telas' }],
    [{ s: 17, d: 1, o: 3, t: 'Organizar o perfil do GitHub' }],
  ];
  const DAYS = [['Seg', 3, 'Segunda, 3 de novembro'], ['Ter', 4, 'Terça, 4 de novembro'], ['Qua', 5, 'Quarta, 5 de novembro'], ['Qui', 6, 'Hoje, quinta, 6 de novembro'], ['Sex', 7, 'Sexta, 7 de novembro'], ['Sáb', 8, 'Sábado, 8 de novembro'], ['Dom', 9, 'Domingo, 9 de novembro']];

  const NOVO = {
    title: 'Trabalho de Algoritmos', due: '24/11',
    reqs: ['3 algoritmos', 'código em C', 'relatório em PDF', 'gráfico comparativo'],
    etapas: [['Implementar os 3 algoritmos', '3h'], ['Medir tempos com 3 tamanhos de entrada', '1h30'], ['Montar o gráfico comparativo', '1h'], ['Escrever o relatório', '2h'], ['Revisar e enviar', '45 min']],
    need: 8.25,
    example: 'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11',
    pdf: { name: 'enunciado_TP2_ordenacao.pdf', size: 'PDF · 214 KB', icon: 'ph-fill ph-file-pdf' },
    blocks: [[7, { s: 19, d: 3, o: 4, t: 'Implementar os 3 algoritmos', st: 'new' }], [9, { s: 10, d: 1.5, o: 4, t: 'Medir tempos com 3 tamanhos de entrada', st: 'new' }], [11, { s: 19, d: 1, o: 4, t: 'Montar o gráfico comparativo', st: 'new' }], [13, { s: 19, d: 2, o: 4, t: 'Escrever o relatório', st: 'new' }], [16, { s: 10, d: .75, o: 4, t: 'Revisar e enviar', st: 'new' }]],
  };

  // Novembro: dia 1 = sábado (mesma semana do protótipo: seg 3 … dom 9)
  const dow = (d) => (d + 4) % 7;
  const WD_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const WD_LONG = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
  function dayLabel(d) { const w = WD_LONG[dow(d)]; return d === 6 ? `Hoje, ${w}, 6 de novembro` : `${w[0].toUpperCase() + w.slice(1)}, ${d} de novembro`; }
  function execMonth() {
    const m = {}; for (let d = 1; d <= 30; d++) m[d] = [];
    WEEK.forEach((items, i) => { m[3 + i] = items.map(b => Object.assign({}, b)); });
    m[1].push({ s: 15, d: 1, o: 2, t: 'Lista 1: revisão de derivadas', st: 'done' });
    m[2].push({ s: 17, d: 1, o: 3, t: 'Criar a conta no GitHub Pages', st: 'done' });
    const eng = ['Diagrama de sequência', 'Modelo de dados', 'Revisão com o grupo', 'Documento de requisitos', 'Ajustes finais do relatório', 'Slides da entrega', 'Revisão final do trabalho', 'Exportar o PDF'];
    let ei = 0; for (let d = 10; d <= 19; d++) if (dow(d) < 5) m[d].push({ s: 10, d: 1.5, o: 1, t: eng[ei++ % eng.length] });
    const calc = ['Lista 4: frações parciais', 'Revisar substituição trigonométrica', 'Simulado da P2', 'Lista 5: integrais impróprias', 'Resolver provas antigas', 'Revisão geral', 'Resumo final'];
    let ci = 0; for (let d = 10; d <= 26; d++) if ([1, 3, 5].includes(dow(d))) m[d].push({ s: 14, d: 1.5, o: 2, t: calc[ci++ % calc.length] });
    const port = ['README do projeto de Grafos', 'Deploy do site pessoal', 'Atualizar o currículo no perfil'];
    [16, 23, 30].forEach((d, i) => m[d].push({ s: 17, d: 1, o: 3, t: port[i] }));
    return m;
  }
  const DEADLINES = [{ day: 20, o: 1, t: 'Trabalho de Engenharia de Software' }, { day: 27, o: 2, t: 'Prova de Cálculo II' }];

  function fmtH(x) { const hh = Math.floor(x), mm = Math.round((x - hh) * 60); return hh + ':' + String(mm).padStart(2, '0'); }
  function fmtDur(d) { if (d < 1) return Math.round(d * 60) + ' min'; const hh = Math.floor(d), mm = Math.round((d - hh) * 60); return hh + 'h' + (mm ? String(mm).padStart(2, '0') : ''); }
  function fmtClock(s) { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

  // Trilhas de etapas por objetivo (ano-base 2025: 06/11 = quinta). m = mês 0–11
  const st = (t, m, d, hr, dur, done, link) => ({ t, m, d, hr, dur, done: !!done, link });
  const TRILHAS = {
    1: [st('Ler o enunciado com o grupo', 9, 29, 10, 1, 1), st('Dividir as tarefas', 9, 30, 10, .5, 1), st('Glossário do sistema', 9, 31, 14, 1, 1), st('Levantar requisitos', 10, 3, 10, 2, 1), st('Casos de uso: atores', 10, 4, 9, 1.5, 1),
      st('Diagrama de casos de uso', 10, 6, 10, 1.5, 0, 0), st('Diagrama de classes', 10, 7, 10, 2), st('Protótipo das telas', 10, 8, 15, 1.5)],
    2: [st('Lista 2: substituição', 10, 3, 14, 1.5, 1), st('Revisar integrais', 10, 5, 15, 1, 1), st('Lista 3: integrais por partes', 10, 6, 14, 1, 0, 1), st('Lista 3: questões 6 a 10', 10, 7, 16, 1.5),
      st('Resumo de técnicas de integração', 10, 8, 10, 2), st('Lista 4: frações parciais', 10, 11, 14, 1.5), st('Simulado da P2', 10, 15, 14, 1.5), st('Resolver provas antigas', 10, 25, 14, 1.5)],
    3: [st('Escolher os projetos', 10, 4, 19, 1, 1), st('README do projeto de Compiladores', 10, 6, 19, .75, 0, 2), st('Organizar o perfil do GitHub', 10, 9, 17, 1), st('README do projeto de Grafos', 10, 16, 17, 1),
      st('Deploy do site pessoal', 10, 23, 17, 1), st('Atualizar o currículo no perfil', 10, 30, 17, 1), st('Gravar a demo do app de Compiladores', 11, 7, 17, 1), st('Escrever um post sobre o projeto', 11, 14, 17, 1),
      st('Fixar os 6 melhores repositórios', 11, 21, 17, .5), st('Revisão final do portfólio', 11, 28, 17, 1)],
    4: [st('Ler o enunciado e separar requisitos', 9, 27, 19, .5, 1), st('Implementar Bubble Sort', 9, 29, 19, 1, 1), st('Implementar Insertion Sort', 9, 31, 19, 1, 1), st('Gerar entradas de teste', 10, 4, 20, .75, 1),
      st('Implementar Merge Sort', 10, 20, 20, 1.5), st('Medir tempos e montar o gráfico', 10, 22, 10, 1.5), st('Escrever o relatório', 10, 23, 14, 2)],
  };
  const ENTREGA = { 1: { m: 10, d: 20, label: 'Entrega' }, 2: { m: 10, d: 27, label: 'Prova' }, 3: null, 4: { m: 10, d: 24, label: 'Entrega' } };
  const OBJ_FULL = { 1: 'Trabalho de Engenharia de Software', 2: 'Prova de Cálculo II', 3: 'Portfólio no GitHub', 4: 'Trabalho de Algoritmos' };
  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const WD3 = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const TODAY = { y: 2025, m: 10, d: 6 };
  const p2 = (n) => String(n).padStart(2, '0');
  function fmtData(dt) { const x = new Date(dt.y, dt.m, dt.d); return `${WD3[x.getDay()]}, ${p2(dt.d)}/${p2(dt.m + 1)}/${dt.y}`; }
  function fmtCurta(m, d, y) { const x = new Date(y || 2025, m, d); return `${WD3[x.getDay()]}, ${d}/${p2(m + 1)}`; }
  function fmtHr(hr) { const hh = Math.floor(hr), mm = Math.round((hr - hh) * 60); return hh + 'h' + (mm ? p2(mm) : ''); }
  function cmpDate(a, b) { return (a.y - b.y) || (a.m - b.m) || (a.d - b.d); }

  window.BoraData = { TRILHAS, ENTREGA, OBJ_FULL, MESES, WD3, TODAY, fmtData, fmtCurta, fmtHr, cmpDate, Broto, STEPS, ALTS, PROBS, ETAPAS, LEVES, OBJ, WEEK, DAYS, NOVO, fmtH, fmtDur, fmtClock, dow, WD_SHORT, dayLabel, execMonth, DEADLINES };
})();
