/// Formatação em pt-BR usada pelas telas (mesmas regras de `bora-data.js`:
/// `fmtDur`, `fmtH`, `fmtHr`, `fmtCurta`, `dayLabel`).
class BoraFormat {
  const BoraFormat._();

  static const _wdLong = [
    'segunda',
    'terça',
    'quarta',
    'quinta',
    'sexta',
    'sábado',
    'domingo',
  ];
  static const _wdShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  static const _months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];

  static String _p2(int n) => n.toString().padLeft(2, '0');

  /// `YYYY-MM-DD`.
  static String dateKey(DateTime d) =>
      '${d.year}-${_p2(d.month)}-${_p2(d.day)}';

  /// Lê `YYYY-MM-DD` como data local.
  static DateTime parseDateKey(String key) {
    final p = key.split('-').map(int.parse).toList();
    return DateTime(p[0], p[1], p[2]);
  }

  /// Segunda-feira da semana de [d].
  static DateTime mondayOf(DateTime d) {
    final day = DateTime(d.year, d.month, d.day);
    return day.subtract(Duration(days: day.weekday - 1));
  }

  static bool sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  /// `10:00` (horário do aparelho).
  static String clock(DateTime d) {
    final l = d.toLocal();
    return '${l.hour}:${_p2(l.minute)}';
  }

  /// `19h`, `19h30`.
  static String hour(DateTime d) {
    final l = d.toLocal();
    return '${l.hour}h${l.minute == 0 ? '' : _p2(l.minute)}';
  }

  /// `45 min`, `1h`, `1h30`, `2h`.
  static String duration(int minutes) {
    if (minutes < 60) return '$minutes min';
    final h = minutes ~/ 60, m = minutes % 60;
    return '${h}h${m == 0 ? '' : _p2(m)}';
  }

  /// `8h15`, `45 min` — total de etapas.
  static String total(int minutes) => duration(minutes);

  /// `Seg`, `Ter` ...
  static String weekdayShort(DateTime d) => _wdShort[d.weekday - 1];

  /// `segunda` ...
  static String weekdayLong(DateTime d) => _wdLong[d.weekday - 1];

  static String _cap(String s) => s[0].toUpperCase() + s.substring(1);

  /// `Quinta, 6 de novembro`.
  static String longDate(DateTime d) =>
      '${_cap(weekdayLong(d))}, ${d.day} de ${_months[d.month - 1]}';

  /// `Hoje, quinta, 6 de novembro` quando [d] é hoje; senão `Sexta, 7 de novembro`.
  static String dayLabel(DateTime d, DateTime today) => sameDay(d, today)
      ? 'Hoje, ${weekdayLong(d)}, ${d.day} de ${_months[d.month - 1]}'
      : longDate(d);

  /// `20/11`.
  static String dayMonth(DateTime d) => '${_p2(d.day)}/${_p2(d.month)}';

  /// `Qua, 29/10` (dia sem zero à esquerda, como `fmtCurta`).
  static String shortDate(DateTime d) =>
      '${weekdayShort(d)}, ${d.day}/${_p2(d.month)}';

  /// `Qui, 06/11/2025` (como `fmtData`).
  static String fullDate(DateTime d) =>
      '${weekdayShort(d)}, ${_p2(d.day)}/${_p2(d.month)}/${d.year}';

  /// `3 a 9 de novembro` (ou `27 de outubro a 2 de novembro`).
  static String weekRange(DateTime monday) {
    final sunday = monday.add(const Duration(days: 6));
    if (monday.month == sunday.month) {
      return '${monday.day} a ${sunday.day} de ${_months[sunday.month - 1]}';
    }
    return '${monday.day} de ${_months[monday.month - 1]} a ${sunday.day} de ${_months[sunday.month - 1]}';
  }

  /// `Novembro 2025`.
  static String monthYear(int year, int month) =>
      '${_cap(_months[month - 1])} $year';

  /// `1 dia` / `2 dias`.
  static String days(int n) => '$n ${n == 1 ? 'dia' : 'dias'}';

  /// `mm:ss`.
  static String timer(int seconds) {
    final s = seconds < 0 ? 0 : seconds;
    return '${_p2(s ~/ 60)}:${_p2(s % 60)}';
  }
}
