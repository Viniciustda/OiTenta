import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/features/auth/presentation/login_screen.dart';

import '../helpers/fake_api.dart';
import '../helpers/test_app.dart';

const _demo = 'Entrar direto como Arthur (demo)';

String _path(WidgetTester tester) => GoRouter.of(
  tester.element(find.byType(LoginScreen)),
).routerDelegate.currentConfiguration.uri.path;

void main() {
  testWidgets(
    'entra com o demo; o 401 seguinte limpa a sessão e volta para /entrar',
    (tester) async {
      final requests = <http.Request>[];
      final deps = AppDependencies.http(
        baseUrl: 'http://api.test',
        client: MockClient((req) async {
          requests.add(req);
          switch (req.url.path) {
            case '/auth/demo':
              return FakeApi.json({
                'token': 'jwt-demo',
                'user': {
                  'id': 'u1',
                  'name': 'Arthur',
                  'email': 'arthur@bora.app',
                  'timezone': 'America/Sao_Paulo',
                },
              }, 200);
            case '/scheduling/availability':
              return FakeApi.json({
                'availability': {
                  'windows': [
                    {'weekday': 0, 'startMinute': 1080, 'endMinute': 1380},
                  ],
                  'dailyLimitMinutes': 180,
                },
              }, 200);
            default:
              return FakeApi.json({
                'statusCode': 401,
                'message': 'Token expirado.',
              }, 401);
          }
        }),
      );

      await pumpApp(tester, deps: deps);
      expect(_path(tester), '/entrar');

      await tester.tap(find.text(_demo));
      await tester.pumpAndSettle();

      // Entrou com o demo e foi ao Hoje, que pediu o plano com o token.
      expect(requests.map((r) => r.url.path), contains('/scheduling/plan/day'));
      final planRequest = requests.firstWhere(
        (r) => r.url.path == '/scheduling/plan/day',
      );
      expect(planRequest.headers['Authorization'], 'Bearer jwt-demo');

      // O 401 limpou a sessão e o router voltou ao login.
      expect(deps.session.session, isNull);
      expect(find.text(_demo), findsOneWidget);
      expect(_path(tester), '/entrar');
    },
  );
}
