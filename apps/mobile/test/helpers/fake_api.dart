import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:oitenta/core/http/api_client.dart';

/// Backend falso para os repositórios HTTP: grava as requisições e responde
/// com o que o teste mandar.
class FakeApi {
  FakeApi({this.token = 'tok-123'});

  String? token;
  final List<http.Request> requests = [];
  int unauthorizedCalls = 0;
  http.Response Function(http.Request) handler = (_) => json({}, 200);

  http.Request get last => requests.last;

  Object? get lastBody => jsonDecode(last.body);

  void respond(Object? body, [int status = 200]) =>
      handler = (_) => json(body, status);

  void fail(int status, String message) => handler = (_) => json({
    'statusCode': status,
    'error': 'Erro',
    'message': message,
    'path': '/x',
    'timestamp': '2026-11-10T22:00:00.000Z',
  }, status);

  late final ApiClient client = ApiClient(
    baseUrl: 'http://api.test',
    client: MockClient((req) async {
      requests.add(req);
      return handler(req);
    }),
    token: () => token,
    onUnauthorized: () => unauthorizedCalls++,
  );

  static http.Response json(Object? body, int status) => http.Response(
    jsonEncode(body),
    status,
    headers: {'content-type': 'application/json; charset=utf-8'},
  );
}
