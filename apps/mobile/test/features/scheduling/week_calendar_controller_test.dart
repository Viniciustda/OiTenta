import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/features/goals/data/goals_repository.dart';
import 'package:oitenta/features/goals/domain/goal.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';
import 'package:oitenta/features/scheduling/domain/plan.dart';
import 'package:oitenta/features/scheduling/presentation/week_controller.dart';

/// Repositório de exemplo que anota cada `GET /scheduling/plan/week?start=`.
class _RecordingScheduling extends SampleSchedulingRepository {
  final starts = <String>[];

  @override
  Future<WeekPlan> getWeekPlan(String start) {
    starts.add(start);
    return super.getWeekPlan(start);
  }
}

/// `GET /goals` controlado pelo teste.
class _FakeGoals implements GoalsRepository {
  _FakeGoals(this.goals);

  final List<GoalSummary> goals;
  int calls = 0;

  @override
  Future<List<GoalSummary>> listGoals() async {
    calls++;
    return goals;
  }

  @override
  Future<GoalDetail> getGoal(String goalId) => throw UnimplementedError();

  @override
  Future<CreateGoalResult> createGoal(NewGoal goal) =>
      throw UnimplementedError();
}

GoalSummary _goal(
  String id,
  String title,
  String? deadline,
  int colorIndex,
  int pct, {
  String status = 'active',
}) => GoalSummary(
  id: id,
  title: title,
  deadline: deadline,
  colorIndex: colorIndex,
  progressPct: pct,
  done: 0,
  total: 5,
  status: status,
  slackDays: deadline == null ? null : 2,
);

final _goals = [
  _goal('g-eng', 'Trabalho de Engenharia de Software', '2025-11-20', 1, 62),
  _goal('g-calc', 'Prova de Cálculo II', '2025-11-27', 2, 30),
  _goal('g-port', 'Portfólio no GitHub', null, 3, 10),
  _goal('g-old', 'Relatório antigo', '2025-11-12', 4, 100, status: 'done'),
];

void main() {
  late _RecordingScheduling repo;
  late _FakeGoals goals;
  late WeekController c;

  setUp(() async {
    repo = _RecordingScheduling();
    goals = _FakeGoals(_goals);
    c = WeekController(
      repo,
      FixedClock(DateTime(2025, 11, 6, 9, 41)),
      goals: goals,
    );
    await c.load();
  });

  group('semana × mês', () {
    test('começa na semana de hoje, em Execução', () {
      expect(c.expanded, isFalse);
      expect(c.mode, CalendarMode.execution);
      expect(c.title, 'Semana');
      expect(c.subtitle, '3 a 9 de novembro');
      expect(repo.starts, ['2025-11-03']);
    });

    test(
      'expandir monta o mês com as semanas que o cobrem (sem endpoint de mês)',
      () async {
        await c.expand();
        expect(c.expanded, isTrue);
        expect(c.title, 'Novembro');
        expect(c.subtitle, 'Arraste pra cima pra voltar à semana');
        // A semana de 3/11 já estava carregada: não pede de novo.
        expect(repo.starts, [
          '2025-11-03',
          '2025-10-27',
          '2025-11-10',
          '2025-11-17',
          '2025-11-24',
        ]);
        final weeks = c.monthWeeks;
        expect(weeks, hasLength(5));
        expect(weeks.first.map((d) => d.number), [27, 28, 29, 30, 31, 1, 2]);
        expect(weeks.last.map((d) => d.number), [24, 25, 26, 27, 28, 29, 30]);
        expect(weeks.first.first.inMonth, isFalse);
        expect(weeks.first[5].inMonth, isTrue);
      },
    );

    test('no mês: hoje, seleção e pontos de Execução por dia', () async {
      await c.expand();
      final cells = c.monthWeeks.expand((w) => w).toList();
      MonthDayView day(int n) =>
          cells.firstWhere((d) => d.inMonth && d.number == n);
      expect(day(6).isToday, isTrue);
      expect(day(6).isSelected, isTrue);
      expect(day(6).colorIndexes, [1, 2, 3]);
      // Semanas além da de hoje, vindas das outras chamadas de semana.
      expect(day(11).colorIndexes, [2]);
      expect(day(16).colorIndexes, [3]);
      // Dias de fora do mês não mostram pontos (29/10 tem bloco na trilha).
      expect(cells[2].number, 29);
      expect(cells[2].colorIndexes, isEmpty);
    });

    test('dia de fora do mês não é selecionável', () async {
      await c.expand();
      c.selectDate(DateTime(2025, 10, 27));
      expect(c.dayLabel, 'Hoje, quinta, 6 de novembro');
    });

    test('escolher um dia no mês mostra a lista desse dia', () async {
      await c.expand();
      c.selectDate(DateTime(2025, 11, 11));
      expect(c.dayLabel, 'Terça, 11 de novembro');
      expect(c.dayBlocks.map((b) => b.title), ['Lista 4: frações parciais']);
    });

    test('recolher volta à semana do dia escolhido', () async {
      await c.expand();
      c.selectDate(DateTime(2025, 11, 20));
      await c.collapse();
      expect(c.expanded, isFalse);
      expect(c.title, 'Semana');
      expect(c.rangeLabel, '17 a 23 de novembro');
      expect(c.subtitle, '17 a 23 de novembro');
      expect(c.selectedIndex, 3);
      expect(c.days.map((d) => d.number), [17, 18, 19, 20, 21, 22, 23]);
    });

    test('legenda de Execução segue o período visível', () async {
      await c.expand();
      expect(c.legend.map((l) => l.colorIndex), [1, 2, 3]);
      c.selectDate(DateTime(2025, 11, 20));
      await c.collapse();
      // Semana de 17 a 23/11: só o Portfólio tem etapa (dia 23).
      expect(c.legend.map((l) => l.title), ['Portfólio no GitHub']);
    });
  });

  group('Execução × Prazos', () {
    test('Prazos busca GET /goals uma vez só', () async {
      await c.setMode(CalendarMode.deadlines);
      await c.setMode(CalendarMode.execution);
      await c.setMode(CalendarMode.deadlines);
      expect(c.mode, CalendarMode.deadlines);
      expect(goals.calls, 1);
    });

    test(
      'no mês, Prazos mostra só o objetivo inteiro, na data do prazo',
      () async {
        await c.expand();
        await c.setMode(CalendarMode.deadlines);
        final cells = c.monthWeeks.expand((w) => w).toList();
        MonthDayView day(int n) =>
            cells.firstWhere((d) => d.inMonth && d.number == n);
        expect(day(20).colorIndexes, [1]);
        expect(day(27).colorIndexes, [2]);
        // Dias com blocos de etapas, mas sem prazo: sem ponto.
        expect(day(6).colorIndexes, isEmpty);
        expect(day(11).colorIndexes, isEmpty);

        c.selectDate(DateTime(2025, 11, 20));
        final d = c.dayDeadlines.single;
        expect(d.title, 'Trabalho de Engenharia de Software');
        expect(d.colorIndex, 1);
        expect(d.progress, 0.62);
        expect(d.progressLabel, '62% concluído');
        // Os blocos das etapas não aparecem em Prazos.
        expect(c.dayBlocks, isEmpty);
      },
    );

    test('objetivo sem prazo não aparece em Prazos', () async {
      await c.expand();
      await c.setMode(CalendarMode.deadlines);
      final all = c.monthWeeks.expand((w) => w).expand((d) => d.colorIndexes);
      expect(all, isNot(contains(3)));
      expect(
        c.legend.map((l) => l.title),
        isNot(contains('Portfólio no GitHub')),
      );
    });

    test('legenda de Prazos: os objetivos com prazo, por data', () async {
      await c.setMode(CalendarMode.deadlines);
      expect(c.legend.map((l) => l.title), [
        'Relatório antigo',
        'Trabalho de Engenharia de Software',
        'Prova de Cálculo II',
      ]);
    });

    test('objetivo concluído com prazo continua em Prazos (100%)', () async {
      await c.expand();
      await c.setMode(CalendarMode.deadlines);
      c.selectDate(DateTime(2025, 11, 12));
      expect(c.dayDeadlines.single.title, 'Relatório antigo');
      expect(c.dayDeadlines.single.progressLabel, '100% concluído');
    });

    test('na semana, a troca muda os pontos e a lista do dia', () async {
      expect(c.days[3].colorIndexes, [1, 2, 3]);
      expect(c.dayBlocks, hasLength(3));
      await c.setMode(CalendarMode.deadlines);
      // Nenhum prazo entre 3 e 9/11.
      expect(c.days.every((d) => d.colorIndexes.isEmpty), isTrue);
      expect(c.dayDeadlines, isEmpty);
      expect(c.dayBlocks, isEmpty);
      await c.setMode(CalendarMode.execution);
      expect(c.days[3].colorIndexes, [1, 2, 3]);
      expect(c.dayBlocks, hasLength(3));
    });

    test('Prazos na semana do prazo, depois de recolher o mês', () async {
      await c.expand();
      await c.setMode(CalendarMode.deadlines);
      c.selectDate(DateTime(2025, 11, 27));
      await c.collapse();
      expect(c.rangeLabel, '24 a 30 de novembro');
      expect(c.days[3].colorIndexes, [2]);
      expect(c.dayDeadlines.single.title, 'Prova de Cálculo II');
    });

    test('sem repositório de objetivos, Prazos fica vazio', () async {
      final semGoals = WeekController(
        SampleSchedulingRepository(),
        FixedClock(DateTime(2025, 11, 6, 9, 41)),
      );
      await semGoals.load();
      await semGoals.setMode(CalendarMode.deadlines);
      expect(semGoals.dayDeadlines, isEmpty);
      expect(semGoals.legend, isEmpty);
    });
  });

  group('bordas do mês', () {
    Future<WeekController> at(DateTime now, {GoalsRepository? goals}) async {
      final w = WeekController(
        SampleSchedulingRepository(),
        FixedClock(now),
        goals: goals,
      );
      await w.load();
      return w;
    }

    test('mês que começa no domingo (junho/2025) tem 6 linhas', () async {
      final w = await at(DateTime(2025, 6, 10, 9));
      await w.expand();
      final weeks = w.monthWeeks;
      expect(w.title, 'Junho');
      expect(weeks, hasLength(6));
      expect(weeks.first.map((d) => d.number), [26, 27, 28, 29, 30, 31, 1]);
      expect(weeks.first.last.inMonth, isTrue);
      expect(weeks.last.map((d) => d.number), [30, 1, 2, 3, 4, 5, 6]);
      expect(weeks.last.first.inMonth, isTrue);
      expect(weeks.last[1].inMonth, isFalse);
    });

    test('mês que começa na segunda (setembro/2025) tem 5 linhas', () async {
      final w = await at(DateTime(2025, 9, 10, 9));
      await w.expand();
      final weeks = w.monthWeeks;
      expect(weeks, hasLength(5));
      expect(weeks.first.map((d) => d.number), [1, 2, 3, 4, 5, 6, 7]);
      expect(weeks.first.every((d) => d.inMonth), isTrue);
      expect(weeks.last.map((d) => d.number), [29, 30, 1, 2, 3, 4, 5]);
      expect(weeks.last.skip(2).every((d) => !d.inMonth), isTrue);
    });

    test('virada de ano: semana de 29/12 a 4/1', () async {
      final w = await at(DateTime(2026, 1, 2, 9));
      expect(w.rangeLabel, '29 de dezembro a 4 de janeiro');
      expect(w.days.map((d) => d.number), [29, 30, 31, 1, 2, 3, 4]);
      expect(w.days[4].isToday, isTrue);
      expect(w.selectedIndex, 4);

      await w.expand();
      expect(w.title, 'Janeiro');
      final weeks = w.monthWeeks;
      expect(weeks, hasLength(5));
      expect(weeks.first.map((d) => d.number), [29, 30, 31, 1, 2, 3, 4]);
      expect(weeks.first.take(3).every((d) => !d.inMonth), isTrue);
      expect(weeks.first[4].isToday, isTrue);

      // Dezembro é de fora do mês: não seleciona.
      w.selectDate(DateTime(2025, 12, 31));
      expect(w.selectedDate, DateTime(2026, 1, 2));
      await w.collapse();
      expect(w.rangeLabel, '29 de dezembro a 4 de janeiro');
    });

    test('no mês, mesmo mês de outro ano não é selecionável', () async {
      final w = await at(DateTime(2025, 11, 6, 9));
      await w.expand();
      w.selectDate(DateTime(2024, 11, 20));
      expect(w.selectedDate, DateTime(2025, 11, 6));
      expect(w.title, 'Novembro');
    });

    test('erro ao carregar o mês: error preenchido e o mês continua', () async {
      final w = WeekController(
        _FailingWeeks(okStart: '2025-11-03'),
        FixedClock(DateTime(2025, 11, 6, 9)),
      );
      await w.load();
      expect(w.error, isNull);
      await w.expand();
      expect(w.error, isNotNull);
      expect(w.expanded, isTrue);
      expect(w.monthWeeks, hasLength(5));
      // A semana já carregada continua com os pontos; as outras vazias.
      final cells = w.monthWeeks.expand((r) => r).toList();
      expect(cells.firstWhere((d) => d.number == 6).colorIndexes, [1, 2, 3]);
      expect(cells.firstWhere((d) => d.number == 11).colorIndexes, isEmpty);
      await w.collapse();
      expect(w.expanded, isFalse);
      expect(w.error, isNull);
      expect(w.dayBlocks, hasLength(3));
    });

    test(
      'erro em Prazos: error preenchido, modo trocado e nova tentativa',
      () async {
        final failing = _FailingGoals();
        final w = await at(DateTime(2025, 11, 6, 9), goals: failing);
        await w.setMode(CalendarMode.deadlines);
        expect(w.error, isNotNull);
        expect(w.mode, CalendarMode.deadlines);
        expect(w.dayDeadlines, isEmpty);
        expect(w.legend, isEmpty);

        await w.setMode(CalendarMode.execution);
        expect(w.mode, CalendarMode.execution);
        expect(w.dayBlocks, hasLength(3));

        failing.fail = false;
        await w.setMode(CalendarMode.deadlines);
        expect(failing.calls, 2);
        expect(w.error, isNull);
        expect(w.legend.map((l) => l.title), [
          'Eng. de Software',
          'Cálculo II',
        ]);
      },
    );
  });
}

/// Só a semana [okStart] responde; as outras falham.
class _FailingWeeks extends SampleSchedulingRepository {
  _FailingWeeks({required this.okStart});

  final String okStart;

  @override
  Future<WeekPlan> getWeekPlan(String start) {
    if (start != okStart) throw Exception('falha de rede');
    return super.getWeekPlan(start);
  }
}

/// `GET /goals` que falha até [fail] virar false.
class _FailingGoals implements GoalsRepository {
  bool fail = true;
  int calls = 0;

  @override
  Future<List<GoalSummary>> listGoals() async {
    calls++;
    if (fail) throw Exception('falha de rede');
    return [
      _goal('g-eng', 'Eng. de Software', '2025-11-20', 1, 62),
      _goal('g-calc', 'Cálculo II', '2025-11-27', 2, 30),
    ];
  }

  @override
  Future<GoalDetail> getGoal(String goalId) => throw UnimplementedError();

  @override
  Future<CreateGoalResult> createGoal(NewGoal goal) =>
      throw UnimplementedError();
}
