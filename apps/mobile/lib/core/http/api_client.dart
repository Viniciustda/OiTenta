import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../errors/app_errors.dart';

/// Lê o token da sessão em memória (P26: sem armazenamento persistente aprovado).
typedef TokenReader = String? Function();

/// Cliente HTTP do app (P26, pacote `http`). Único ponto que fala com o backend:
/// monta a URL a partir de `AppConfig.apiUrl`, envia `Authorization: Bearer`,
/// converte o corpo de erro `{ statusCode, message }` nos erros de
/// `app_errors.dart` e avisa [onUnauthorized] no 401 de rota autenticada.
class ApiClient {
  ApiClient({
    required String baseUrl,
    required http.Client client,
    required TokenReader token,
    void Function()? onUnauthorized,
    Duration timeout = defaultTimeout,
  }) : _timeout = timeout,
       _baseUrl = baseUrl.endsWith('/')
           ? baseUrl.substring(0, baseUrl.length - 1)
           : baseUrl,
       _client = client,
       _token = token,
       _onUnauthorized = onUnauthorized;

  /// Tempo máximo de espera por uma resposta.
  static const defaultTimeout = Duration(seconds: 15);

  final Duration _timeout;
  final String _baseUrl;
  final http.Client _client;
  final TokenReader _token;
  final void Function()? _onUnauthorized;

  Future<dynamic> get(
    String path, {
    Map<String, String>? query,
    bool auth = true,
  }) => _send('GET', path, query: query, auth: auth);

  /// [timeout] troca o [defaultTimeout] só nesta chamada (ex.: o rascunho da
  /// IA, que espera mais).
  Future<dynamic> post(
    String path, {
    Object? body,
    bool auth = true,
    Duration? timeout,
  }) => _send('POST', path, body: body, auth: auth, timeout: timeout);

  Future<dynamic> put(String path, {Object? body, bool auth = true}) =>
      _send('PUT', path, body: body, auth: auth);

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, String>? query,
    Object? body,
    required bool auth,
    Duration? timeout,
  }) async {
    final limit = timeout ?? _timeout;
    var uri = Uri.parse('$_baseUrl$path');
    if (query != null && query.isNotEmpty) {
      uri = uri.replace(queryParameters: query);
    }
    final request = http.Request(method, uri)
      ..headers['Accept'] = 'application/json';
    final token = auth ? _token() : null;
    if (token != null) request.headers['Authorization'] = 'Bearer $token';
    if (body != null) {
      request.headers['Content-Type'] = 'application/json; charset=utf-8';
      request.body = jsonEncode(body);
    }

    final http.Response response;
    try {
      // O tempo limite vale para a requisição inteira (envio + corpo).
      response = await _client
          .send(request)
          .then(http.Response.fromStream)
          .timeout(limit);
    } on http.ClientException catch (e) {
      throw NetworkFailure(e.message);
    } on TimeoutException {
      throw NetworkFailure('Sem resposta em ${limit.inSeconds} s.');
    }

    final status = response.statusCode;
    final decoded = _decode(response);
    if (status >= 200 && status < 300) return decoded;

    final message = decoded is Map && decoded['message'] is String
        ? decoded['message'] as String
        : 'Erro $status.';
    switch (status) {
      case 400 || 422:
        final details = decoded is Map && decoded['details'] is List
            ? [for (final d in decoded['details'] as List) d.toString()]
            : const <String>[];
        throw ValidationFailure(message, details: details);
      case 404:
        throw NotFoundFailure(message);
      case 401:
        if (auth) _onUnauthorized?.call();
        throw UnauthorizedFailure(message);
      case 409:
        throw ConflictFailure(message);
      default:
        throw ApiFailure(status, message);
    }
  }

  static Object? _decode(http.Response response) {
    final text = utf8.decode(response.bodyBytes);
    if (text.isEmpty) return null;
    try {
      return jsonDecode(text);
    } on FormatException {
      return null;
    }
  }
}

/// Tira as chaves nulas do primeiro nível do corpo: campos opcionais ausentes
/// não vão no JSON (o backend recusa campos não previstos, P19).
Map<String, dynamic> withoutNulls(Map<String, dynamic> json) => {
  for (final e in json.entries)
    if (e.value != null) e.key: e.value,
};
