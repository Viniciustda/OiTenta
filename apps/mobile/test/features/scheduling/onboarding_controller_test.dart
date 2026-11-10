import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/auth/data/session_store.dart';
import 'package:oitenta/features/auth/domain/auth_user.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';
import 'package:oitenta/features/scheduling/domain/availability.dart';
import 'package:oitenta/features/scheduling/presentation/onboarding_controller.dart';

void main() {
  late SampleSchedulingRepository repo;
  late OnboardingController c;
  setUp(() {
    repo = SampleSchedulingRepository(hasAvailability: false);
    final s = SessionStore()
      ..save(const AuthSession(
          token: 't', user: AuthUser(id: '1', name: 'Arthur', email: 'a@a', timezone: 'America/Sao_Paulo')));
    c = OnboardingController(repo, s);
  });

  test('começa no passo 1 de 6 e avança/volta', () {
    expect(c.step, 1);
    expect(c.progress, closeTo(1 / 6, .001));
    c.next();
    expect(c.step, 2);
    c.back();
    expect(c.step, 1);
    c.back();
    expect(c.step, 1);
  });

  test('a resposta do T01 é guardada e avança', () {
    c.goTo(2);
    c.chooseStuck('Saber por onde ir');
    expect(c.stuckAnswer, 'Saber por onde ir');
    expect(c.step, 3);
  });

  test('a grade marca e desmarca períodos e conta as horas (2h por período)', () {
    expect(c.canContinueGrid, isFalse);
    c.togglePeriod(0, FreePeriod.night);
    c.togglePeriod(1, FreePeriod.night);
    c.togglePeriod(1, FreePeriod.night);
    expect(c.isSelected(0, FreePeriod.night), isTrue);
    expect(c.periodCount, 1);
    expect(c.approxHours, 2);
    expect(c.canContinueGrid, isTrue);
  });

  test('o limite vai de 1h a 8h, começa em 4h', () {
    expect(c.limitHours, 4);
    c.setLimit(9);
    expect(c.limitHours, 8);
    c.setLimit(0);
    expect(c.limitHours, 1);
  });

  test('salvar envia janelas por período (seg=1 … dom=0) e o limite em minutos', () async {
    c.togglePeriod(0, FreePeriod.night); // segunda
    c.togglePeriod(6, FreePeriod.morning); // domingo
    c.setLimit(3);
    c.goTo(5);
    final ok = await c.save();
    expect(ok, isTrue);
    final a = (await repo.getAvailability())!;
    expect(a.dailyLimitMinutes, 180);
    expect(a.windows, containsAll(const [
      AvailabilityWindow(weekday: 1, startMinute: 1080, endMinute: 1380),
      AvailabilityWindow(weekday: 0, startMinute: 360, endMinute: 720),
    ]));
    expect(c.step, 6);
  });

  test('nome do usuário vem da sessão', () => expect(c.userName, 'Arthur'));
}
