import 'package:flutter_test/flutter_test.dart';
import 'package:http/testing.dart';
import 'package:oitenta/core/di/app_dependencies.dart';

import '../helpers/fake_api.dart';
import '../helpers/test_app.dart';

void main() {
  testWidgets('401 numa tela logada limpa a sessão e o router leva ao login', (
    tester,
  ) async {
    final deps = AppDependencies.http(
      baseUrl: 'http://api.test',
      client: MockClient((req) async {
        if (req.url.path == '/auth/demo') {
          return FakeApi.json({
            'token': 'jwt',
            'user': {
              'id': 'u1',
              'name': 'Arthur',
              'email': 'arthur@bora.app',
              'timezone': 'America/Sao_Paulo',
            },
          }, 200);
        }
        return FakeApi.json({
          'statusCode': 401,
          'message': 'Token expirado.',
        }, 401);
      }),
    );
    await pumpApp(tester, location: '/objetivos', deps: deps);
    expect(deps.session.session, isNull);
    expect(find.text('Entrar direto como Arthur (demo)'), findsOneWidget);
  });
}
