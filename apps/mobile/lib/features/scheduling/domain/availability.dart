/// `{ weekday: 0–6, startMinute, endMinute }` (contrato §2; modelagem 3.1).
class AvailabilityWindow {
  const AvailabilityWindow({
    required this.weekday,
    required this.startMinute,
    required this.endMinute,
  });

  final int weekday;
  final int startMinute;
  final int endMinute;

  Map<String, dynamic> toJson() => {
    'weekday': weekday,
    'startMinute': startMinute,
    'endMinute': endMinute,
  };

  factory AvailabilityWindow.fromJson(Map<String, dynamic> json) =>
      AvailabilityWindow(
        weekday: json['weekday'] as int,
        startMinute: json['startMinute'] as int,
        endMinute: json['endMinute'] as int,
      );

  @override
  bool operator ==(Object other) =>
      other is AvailabilityWindow &&
      other.weekday == weekday &&
      other.startMinute == startMinute &&
      other.endMinute == endMinute;

  @override
  int get hashCode => Object.hash(weekday, startMinute, endMinute);
}

/// `{ windows, dailyLimitMinutes }`.
class WeeklyAvailability {
  const WeeklyAvailability({
    required this.windows,
    required this.dailyLimitMinutes,
  });

  final List<AvailabilityWindow> windows;
  final int dailyLimitMinutes;

  Map<String, dynamic> toJson() => {
    'windows': windows.map((w) => w.toJson()).toList(),
    'dailyLimitMinutes': dailyLimitMinutes,
  };

  factory WeeklyAvailability.fromJson(Map<String, dynamic> json) =>
      WeeklyAvailability(
        windows: (json['windows'] as List)
            .map((w) => AvailabilityWindow.fromJson(w as Map<String, dynamic>))
            .toList(),
        dailyLimitMinutes: json['dailyLimitMinutes'] as int,
      );
}

/// Os 3 períodos da grade do onboarding mobile (T02): manhã 6–12, tarde 12–18,
/// noite 18–23. Cada período marcado vira uma janela (modelagem 3.1).
enum FreePeriod {
  morning(360, 720),
  afternoon(720, 1080),
  night(1080, 1380);

  const FreePeriod(this.startMinute, this.endMinute);

  final int startMinute;
  final int endMinute;
}
