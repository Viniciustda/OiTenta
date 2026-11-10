import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/format/bora_format.dart';

void main() {
  test('durações como no protótipo', () {
    expect(BoraFormat.duration(45), '45 min');
    expect(BoraFormat.duration(60), '1h');
    expect(BoraFormat.duration(90), '1h30');
    expect(BoraFormat.duration(495), '8h15');
  });

  test('datas', () {
    final d = DateTime(2025, 11, 6);
    expect(BoraFormat.longDate(d), 'Quinta, 6 de novembro');
    expect(BoraFormat.dayLabel(d, d), 'Hoje, quinta, 6 de novembro');
    expect(BoraFormat.shortDate(DateTime(2025, 10, 29)), 'Qua, 29/10');
    expect(BoraFormat.weekRange(DateTime(2025, 11, 3)), '3 a 9 de novembro');
    expect(BoraFormat.mondayOf(d), DateTime(2025, 11, 3));
    expect(BoraFormat.dateKey(d), '2025-11-06');
    expect(BoraFormat.timer(180), '03:00');
  });
}
