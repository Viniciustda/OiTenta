import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/core/config/app_config.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/features/activation/data/http_activation_repository.dart';
import 'package:oitenta/features/activation/data/sample_activation_repository.dart';
import 'package:oitenta/features/auth/data/http_auth_repository.dart';
import 'package:oitenta/features/auth/data/sample_auth_repository.dart';
import 'package:oitenta/features/auth/domain/auth_user.dart';
import 'package:oitenta/features/gamification/data/sample_gamification_repository.dart';
import 'package:oitenta/features/goals/data/http_goals_repository.dart';
import 'package:oitenta/features/scheduling/data/http_scheduling_repository.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';

import '../helpers/fake_api.dart';

void main() {
  test('DATA_SOURCE padrão é http', () {
    expect(AppConfig.dataSource, 'http');
  });

  test('DATA_SOURCE=sample monta os repositórios de exemplo', () {
    final d = AppDependencies.forDataSource('sample');
    expect(d.auth, isA<SampleAuthRepository>());
    expect(d.scheduling, isA<SampleSchedulingRepository>());
    expect(d.activation, isA<SampleActivationRepository>());
    expect(d.clock, isA<FixedClock>());
  });

  test(
    'DATA_SOURCE=http monta os repositórios HTTP; gamificação fixa (P18)',
    () {
      final d = AppDependencies.forDataSource('http');
      expect(d.auth, isA<HttpAuthRepository>());
      expect(d.scheduling, isA<HttpSchedulingRepository>());
      expect(d.goals, isA<HttpGoalsRepository>());
      expect(d.activation, isA<HttpActivationRepository>());
      expect(d.gamification, isA<SampleGamificationRepository>());
      expect(d.clock, isA<SystemClock>());
    },
  );

  test('DATA_SOURCE desconhecido → erro', () {
    expect(() => AppDependencies.forDataSource('xyz'), throwsArgumentError);
  });

  test('http usa a base configurada e o token da sessão', () async {
    final requests = <http.Request>[];
    final d = AppDependencies.http(
      baseUrl: 'http://api.test',
      client: MockClient((r) async {
        requests.add(r);
        return FakeApi.json({'goals': []}, 200);
      }),
    );
    d.session.save(
      const AuthSession(
        token: 'jwt-x',
        user: AuthUser(
          id: 'u',
          name: 'A',
          email: 'a@b.c',
          timezone: 'America/Sao_Paulo',
        ),
      ),
    );
    await d.goals.listGoals();
    expect(requests.single.url.toString(), 'http://api.test/goals');
    expect(requests.single.headers['Authorization'], 'Bearer jwt-x');
  });

  test('401 de rota autenticada expira a sessão', () async {
    final d = AppDependencies.http(
      baseUrl: 'http://api.test',
      client: MockClient(
        (_) async => FakeApi.json({
          'statusCode': 401,
          'message': 'Token inválido.',
        }, 401),
      ),
    );
    d.session.save(
      const AuthSession(
        token: 'velho',
        user: AuthUser(
          id: 'u',
          name: 'A',
          email: 'a@b.c',
          timezone: 'America/Sao_Paulo',
        ),
      ),
    );
    await expectLater(d.goals.listGoals(), throwsA(anything));
    expect(d.session.session, isNull);
    expect(d.session.expired, isTrue);
  });
}
