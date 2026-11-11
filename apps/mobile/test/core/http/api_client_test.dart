import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:oitenta/core/errors/app_errors.dart';
import 'package:oitenta/core/http/api_client.dart';

http.Response jsonResponse(Object? body, int status) => http.Response(
  jsonEncode(body),
  status,
  headers: {'content-type': 'application/json; charset=utf-8'},
);

Map<String, dynamic> errorBody(int status, String message) => {
  'statusCode': status,
  'error': 'Erro',
  'message': message,
  'path': '/x',
  'timestamp': '2026-11-10T22:00:00.000Z',
};

void main() {
  late List<http.Request> requests;
  late int unauthorizedCalls;
  String? token;

  ApiClient clientReturning(
    http.Response response, {
    String base = 'http://api.test:4000',
  }) {
    requests = [];
    unauthorizedCalls = 0;
    return ApiClient(
      baseUrl: base,
      client: MockClient((req) async {
        requests.add(req);
        return response;
      }),
      token: () => token,
      onUnauthorized: () => unauthorizedCalls++,
    );
  }

  setUp(() => token = 'tok-123');

  test('monta a URL a partir da base, com a query', () async {
    final api = clientReturning(jsonResponse({'ok': true}, 200));
    final body = await api.get(
      '/scheduling/plan/day',
      query: {'date': '2026-11-10'},
    );
    expect(body, {'ok': true});
    expect(requests.single.method, 'GET');
    expect(
      requests.single.url.toString(),
      'http://api.test:4000/scheduling/plan/day?date=2026-11-10',
    );
  });

  test('aceita base com barra no fim', () async {
    final api = clientReturning(
      jsonResponse({}, 200),
      base: 'http://api.test:4000/',
    );
    await api.get('/goals');
    expect(requests.single.url.toString(), 'http://api.test:4000/goals');
  });

  test(
    'rota autenticada envia Authorization: Bearer com o token em memória',
    () async {
      final api = clientReturning(jsonResponse({}, 200));
      await api.get('/auth/me');
      expect(requests.single.headers['Authorization'], 'Bearer tok-123');
      expect(requests.single.headers['Accept'], 'application/json');
    },
  );

  test('rota pública não envia Authorization', () async {
    final api = clientReturning(jsonResponse({}, 200));
    await api.post('/auth/demo', auth: false);
    expect(requests.single.headers.containsKey('Authorization'), isFalse);
  });

  test('sem token, não envia Authorization', () async {
    token = null;
    final api = clientReturning(jsonResponse({}, 200));
    await api.get('/goals');
    expect(requests.single.headers.containsKey('Authorization'), isFalse);
  });

  test('POST e PUT mandam o corpo em JSON', () async {
    final api = clientReturning(jsonResponse({'id': 1}, 201));
    await api.post('/goals', body: {'title': 'A'});
    expect(requests.single.method, 'POST');
    expect(
      requests.single.headers['Content-Type'],
      startsWith('application/json'),
    );
    expect(jsonDecode(requests.single.body), {'title': 'A'});

    final api2 = clientReturning(jsonResponse({}, 200));
    await api2.put('/scheduling/availability', body: {'a': 1});
    expect(requests.single.method, 'PUT');
    expect(jsonDecode(requests.single.body), {'a': 1});
  });

  test('decodifica UTF-8 da resposta', () async {
    final api = clientReturning(jsonResponse({'t': 'Ação'}, 200));
    expect(await api.get('/x'), {'t': 'Ação'});
  });

  group('erros do corpo {statusCode, message}', () {
    test('400 → ValidationFailure com a mensagem', () async {
      final api = clientReturning(
        jsonResponse(errorBody(400, 'date inválida'), 400),
      );
      await expectLater(
        api.get('/x'),
        throwsA(
          isA<ValidationFailure>().having(
            (e) => e.message,
            'message',
            'date inválida',
          ),
        ),
      );
    });

    test('422 → ValidationFailure com os details do corpo', () async {
      final api = clientReturning(
        jsonResponse({
          ...errorBody(422, 'Dados inválidos.'),
          'details': ['TITLE_EMPTY', 'STEPS_EMPTY'],
        }, 422),
      );
      await expectLater(
        api.post('/x'),
        throwsA(
          isA<ValidationFailure>()
              .having((e) => e.message, 'message', 'Dados inválidos.')
              .having((e) => e.details, 'details', [
                'TITLE_EMPTY',
                'STEPS_EMPTY',
              ]),
        ),
      );
    });

    test('400 sem details → ValidationFailure com details vazio', () async {
      final api = clientReturning(jsonResponse(errorBody(400, 'x'), 400));
      await expectLater(
        api.get('/x'),
        throwsA(
          isA<ValidationFailure>().having((e) => e.details, 'details', isEmpty),
        ),
      );
    });

    test('404 → NotFoundFailure com a mensagem', () async {
      final api = clientReturning(
        jsonResponse(errorBody(404, 'Objetivo não encontrado.'), 404),
      );
      await expectLater(
        api.get('/goals/x'),
        throwsA(
          isA<NotFoundFailure>().having(
            (e) => e.message,
            'message',
            'Objetivo não encontrado.',
          ),
        ),
      );
    });

    test('409 → ConflictFailure', () async {
      final api = clientReturning(
        jsonResponse(errorBody(409, 'E-mail já cadastrado.'), 409),
      );
      await expectLater(
        api.post('/auth/register', auth: false),
        throwsA(
          isA<ConflictFailure>().having(
            (e) => e.message,
            'message',
            'E-mail já cadastrado.',
          ),
        ),
      );
    });

    test(
      '401 em rota autenticada → UnauthorizedFailure e limpa a sessão pelo callback',
      () async {
        final api = clientReturning(
          jsonResponse(errorBody(401, 'Token inválido.'), 401),
        );
        await expectLater(
          api.get('/goals'),
          throwsA(isA<UnauthorizedFailure>()),
        );
        expect(unauthorizedCalls, 1);
      },
    );

    test(
      '401 em rota pública (login errado) → UnauthorizedFailure sem limpar a sessão',
      () async {
        final api = clientReturning(
          jsonResponse(errorBody(401, 'Credenciais inválidas.'), 401),
        );
        await expectLater(
          api.post('/auth/login', auth: false),
          throwsA(
            isA<UnauthorizedFailure>().having(
              (e) => e.message,
              'message',
              'Credenciais inválidas.',
            ),
          ),
        );
        expect(unauthorizedCalls, 0);
      },
    );

    test('500 → ApiFailure com o status', () async {
      final api = clientReturning(
        jsonResponse(errorBody(500, 'Erro interno.'), 500),
      );
      await expectLater(
        api.get('/x'),
        throwsA(
          isA<ApiFailure>().having((e) => e.statusCode, 'statusCode', 500),
        ),
      );
    });

    test('corpo de erro que não é JSON → ApiFailure com o status', () async {
      final api = clientReturning(
        http.Response('<html>bad gateway</html>', 502),
      );
      await expectLater(
        api.get('/x'),
        throwsA(
          isA<ApiFailure>().having((e) => e.statusCode, 'statusCode', 502),
        ),
      );
    });
  });

  test('falha de rede → NetworkFailure', () async {
    final api = ApiClient(
      baseUrl: 'http://api.test',
      client: MockClient((_) async => throw http.ClientException('sem rede')),
      token: () => null,
    );
    await expectLater(api.get('/x'), throwsA(isA<NetworkFailure>()));
  });

  test('o tempo limite padrão é 15 s', () {
    expect(ApiClient.defaultTimeout, const Duration(seconds: 15));
  });

  test('resposta que passa do tempo limite → NetworkFailure', () async {
    final api = ApiClient(
      baseUrl: 'http://api.test',
      client: MockClient((_) async {
        await Future<void>.delayed(const Duration(milliseconds: 200));
        return jsonResponse({}, 200);
      }),
      token: () => null,
      timeout: const Duration(milliseconds: 20),
    );
    await expectLater(api.get('/x'), throwsA(isA<NetworkFailure>()));
  });

  test('withoutNulls tira as chaves nulas do primeiro nível', () {
    expect(
      withoutNulls({
        'a': 1,
        'b': null,
        'c': {'d': null},
      }),
      {
        'a': 1,
        'c': {'d': null},
      },
    );
  });
}
