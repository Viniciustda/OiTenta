import 'package:flutter/foundation.dart';

import '../../../core/clock/clock.dart';
import '../../../core/format/bora_format.dart';
import '../data/scheduling_repository.dart';
import '../domain/plan.dart';

class WeekDayView {
  const WeekDayView({
    required this.date,
    required this.weekday,
    required this.number,
    required this.isToday,
    required this.colorIndexes,
  });

  final DateTime date;
  final String weekday;
  final int number;
  final bool isToday;
  final List<int> colorIndexes;
}

class WeekBlockView {
  const WeekBlockView({
    required this.time,
    required this.goalTitle,
    required this.colorIndex,
    required this.title,
    required this.duration,
    required this.done,
    required this.pill,
  });

  final String time;
  final String goalTitle;
  final int colorIndex;
  final String title;
  final String duration;
  final bool done;
  final String? pill;
}

class LegendItem {
  const LegendItem({required this.colorIndex, required this.title});

  final int colorIndex;
  final String title;
}

/// Semana (M03): semana compacta, legenda e lista do dia.
class WeekController extends ChangeNotifier {
  WeekController(this._repo, this._clock);

  final SchedulingRepository _repo;
  final Clock _clock;

  bool loading = true;
  String? error;
  WeekPlan? _week;
  late DateTime _monday;
  int selectedIndex = 0;

  Future<void> load() async {
    final today = _clock.now();
    _monday = BoraFormat.mondayOf(today);
    selectedIndex = today.weekday - 1;
    loading = true;
    notifyListeners();
    try {
      _week = await _repo.getWeekPlan(BoraFormat.dateKey(_monday));
    } catch (_) {
      error = 'Não deu pra carregar a semana.';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  String get rangeLabel => BoraFormat.weekRange(_monday);

  List<WeekDayView> get days {
    final today = _clock.now();
    return [
      for (var i = 0; i < 7; i++)
        () {
          final d = DateTime(_monday.year, _monday.month, _monday.day + i);
          final blocks = _week?.days[i].blocks ?? const <PlanBlock>[];
          final colors = <int>[];
          for (final b in blocks) {
            if (!colors.contains(b.colorIndex)) colors.add(b.colorIndex);
          }
          return WeekDayView(
            date: d,
            weekday: BoraFormat.weekdayShort(d),
            number: d.day,
            isToday: BoraFormat.sameDay(d, today),
            colorIndexes: colors.take(4).toList(),
          );
        }(),
    ];
  }

  List<LegendItem> get legend {
    final map = <int, String>{};
    for (final d in _week?.days ?? const <DayPlan>[]) {
      for (final b in d.blocks) {
        map.putIfAbsent(b.colorIndex, () => b.goalTitle);
      }
    }
    final keys = map.keys.toList()..sort();
    return [for (final k in keys) LegendItem(colorIndex: k, title: map[k]!)];
  }

  String get dayLabel =>
      BoraFormat.dayLabel(days[selectedIndex].date, _clock.now());

  List<WeekBlockView> get dayBlocks => [
    for (final b in _week?.days[selectedIndex].blocks ?? const <PlanBlock>[])
      WeekBlockView(
        time: BoraFormat.clock(b.start),
        goalTitle: b.goalTitle,
        colorIndex: b.colorIndex,
        title: b.stepTitle,
        duration: BoraFormat.duration(b.minutes),
        done: b.status == 'done',
        pill: b.status == 'done'
            ? 'Concluída'
            : b.status == 'missed'
            ? 'Reagendada'
            : null,
      ),
  ];

  void selectDay(int i) {
    selectedIndex = i;
    notifyListeners();
  }
}
