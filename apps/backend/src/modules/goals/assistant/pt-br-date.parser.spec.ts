import { parsePtBrDate } from './pt-br-date.parser';

// Hoje fixo: quarta-feira, 11/11/2026 (docs/7-proposta-ia.md §a.3).
const TODAY = '2026-11-11';

describe('parsePtBrDate (hoje = qua 2026-11-11)', () => {
  describe('dd/mm/aaaa, dd/mm/aa, dd/mm, dd-mm', () => {
    test.each([
      ['entrega 24/11', '2026-11-24'],
      ['entrega 24/11/2026', '2026-11-24'],
      ['entrega 24/11/26', '2026-11-24'],
      ['entrega 24-11', '2026-11-24'],
      ['prova 5/1', '2027-01-05'],
      ['hoje mesmo: 11/11', '2026-11-11'],
      ['para 3/12/2027', '2027-12-03'],
    ])('"%s" → %s', (text, expected) => {
      expect(parsePtBrDate(text, TODAY)).toBe(expected);
    });

    test('data impossível "31/02" → null', () => {
      expect(parsePtBrDate('entrega 31/02', TODAY)).toBeNull();
    });

    test('data com ano no passado "10/11/2026" → null', () => {
      expect(parsePtBrDate('entrega 10/11/2026', TODAY)).toBeNull();
    });

    test('mês impossível "10/13" → null', () => {
      expect(parsePtBrDate('entrega 10/13', TODAY)).toBeNull();
    });

    test('sem ano e já passou neste ano ("10/11") → o mesmo dia do ano seguinte', () => {
      expect(parsePtBrDate('entrega 10/11', TODAY)).toBe('2027-11-10');
    });

    test('vale antes das outras regras ("amanhã ou 24/11")', () => {
      expect(parsePtBrDate('amanhã ou 24/11', TODAY)).toBe('2026-11-24');
    });
  });

  describe('dia dd', () => {
    test('"para dia 20" → 2026-11-20 (mês atual)', () => {
      expect(parsePtBrDate('para dia 20', TODAY)).toBe('2026-11-20');
    });

    test('"dia 11" (hoje) → 2026-11-11', () => {
      expect(parsePtBrDate('dia 11', TODAY)).toBe('2026-11-11');
    });

    test('"dia 5" (já passou) → 2026-12-05 (próximo mês)', () => {
      expect(parsePtBrDate('dia 5', TODAY)).toBe('2026-12-05');
    });

    test('"dia 5" em dezembro vira janeiro do ano seguinte', () => {
      expect(parsePtBrDate('dia 5', '2026-12-20')).toBe('2027-01-05');
    });

    test('"dia 31" em novembro (impossível) → null', () => {
      expect(parsePtBrDate('dia 31', TODAY)).toBeNull();
    });

    test('"dia 20 de dezembro" usa a regra "dd de <mês>"', () => {
      expect(parsePtBrDate('dia 20 de dezembro', TODAY)).toBe('2026-12-20');
    });
  });

  describe('dd de <mês>', () => {
    test('"3 de dezembro" → 2026-12-03', () => {
      expect(parsePtBrDate('3 de dezembro', TODAY)).toBe('2026-12-03');
    });

    test('"11 de novembro" (hoje) → 2026-11-11', () => {
      expect(parsePtBrDate('11 de novembro', TODAY)).toBe('2026-11-11');
    });

    test('"2 de março" (já passou) → 2027-03-02', () => {
      expect(parsePtBrDate('2 de março', TODAY)).toBe('2027-03-02');
    });

    test('sem acento: "2 de marco" → 2027-03-02', () => {
      expect(parsePtBrDate('2 de marco', TODAY)).toBe('2027-03-02');
    });

    test('maiúsculas: "3 DE DEZEMBRO" → 2026-12-03', () => {
      expect(parsePtBrDate('3 DE DEZEMBRO', TODAY)).toBe('2026-12-03');
    });

    test('impossível "31 de abril" → null', () => {
      expect(parsePtBrDate('31 de abril', TODAY)).toBeNull();
    });
  });

  describe('hoje, amanhã, depois de amanhã', () => {
    test.each([
      ['hoje', '2026-11-11'],
      ['amanhã', '2026-11-12'],
      ['amanha', '2026-11-12'],
      ['AMANHÃ', '2026-11-12'],
      ['depois de amanhã', '2026-11-13'],
      ['depois de amanha', '2026-11-13'],
    ])('"%s" → %s', (text, expected) => {
      expect(parsePtBrDate(`entregar ${text}`, TODAY)).toBe(expected);
    });

    test('virada de ano: "amanhã" em 31/12 → 2027-01-01', () => {
      expect(parsePtBrDate('amanhã', '2026-12-31')).toBe('2027-01-01');
    });
  });

  describe('dia da semana (a próxima ocorrência depois de hoje)', () => {
    test.each([
      ['sexta', '2026-11-13'],
      ['sexta-feira', '2026-11-13'],
      ['sexta feira', '2026-11-13'],
      ['quarta-feira', '2026-11-18'],
      ['quarta', '2026-11-18'],
      ['quinta', '2026-11-12'],
      ['sábado', '2026-11-14'],
      ['sabado', '2026-11-14'],
      ['domingo', '2026-11-15'],
      ['segunda', '2026-11-16'],
      ['terça-feira', '2026-11-17'],
      ['terca', '2026-11-17'],
    ])('"%s" → %s', (text, expected) => {
      expect(parsePtBrDate(`entrega na ${text}`, TODAY)).toBe(expected);
    });
  });

  describe('semana que vem / próxima semana (domingo da semana seguinte)', () => {
    test.each([
      ['semana que vem', '2026-11-22'],
      ['próxima semana', '2026-11-22'],
      ['proxima semana', '2026-11-22'],
    ])('"%s" → %s', (text, expected) => {
      expect(parsePtBrDate(`termino ${text}`, TODAY)).toBe(expected);
    });

    test('hoje domingo (15/11) → domingo seguinte 2026-11-22', () => {
      expect(parsePtBrDate('semana que vem', '2026-11-15')).toBe('2026-11-22');
    });

    test('hoje segunda (16/11) → 2026-11-29', () => {
      expect(parsePtBrDate('semana que vem', '2026-11-16')).toBe('2026-11-29');
    });
  });

  describe('em N dias / daqui a N dias', () => {
    test.each([
      ['em 10 dias', '2026-11-21'],
      ['daqui a 10 dias', '2026-11-21'],
      ['daqui a 1 dia', '2026-11-12'],
      ['em 30 dias', '2026-12-11'],
    ])('"%s" → %s', (text, expected) => {
      expect(parsePtBrDate(text, TODAY)).toBe(expected);
    });
  });

  describe('fim do mês', () => {
    test('"fim do mês" → 2026-11-30', () => {
      expect(parsePtBrDate('até o fim do mês', TODAY)).toBe('2026-11-30');
    });

    test('"fim do mes" em fevereiro de ano não bissexto → 2027-02-28', () => {
      expect(parsePtBrDate('fim do mes', '2027-02-10')).toBe('2027-02-28');
    });
  });

  describe('sem data', () => {
    test('texto sem data → null', () => {
      expect(
        parsePtBrDate('Estudar para a prova de cálculo com calma', TODAY),
      ).toBeNull();
    });

    test('"dias" sem número não é "dia dd" → null', () => {
      expect(parsePtBrDate('preciso de alguns dias 2 vezes', TODAY)).toBeNull();
    });

    test('"today" inválido → null', () => {
      expect(parsePtBrDate('amanhã', 'ontem')).toBeNull();
    });
  });

  describe('ordem das regras: a primeira que casar vale', () => {
    test('"dia 20" vence "amanhã"', () => {
      expect(parsePtBrDate('amanhã começo, entrega dia 20', TODAY)).toBe(
        '2026-11-20',
      );
    });

    test('"hoje" vence "sexta"', () => {
      expect(parsePtBrDate('sexta ou hoje', TODAY)).toBe('2026-11-11');
    });

    test('dia da semana vence "em N dias"', () => {
      expect(parsePtBrDate('em 10 dias ou sexta', TODAY)).toBe('2026-11-13');
    });
  });

  test('texto de referência → 2026-11-24', () => {
    expect(
      parsePtBrDate(
        'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11',
        TODAY,
      ),
    ).toBe('2026-11-24');
  });
});
