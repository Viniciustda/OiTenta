/// Fonte do "agora". Os dados de exemplo usam [FixedClock] na data do
/// protótipo (quinta, 6/11/2025); o app real usa [SystemClock].
abstract class Clock {
  DateTime now();
}

class SystemClock implements Clock {
  const SystemClock();

  @override
  DateTime now() => DateTime.now();
}

class FixedClock implements Clock {
  const FixedClock(this.value);

  final DateTime value;

  @override
  DateTime now() => value;
}
