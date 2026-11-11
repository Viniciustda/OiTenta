/// Erros que os repositórios devolvem às telas, espelhando o contrato:
/// 400/422 → [ValidationFailure]; 404 → [NotFoundFailure];
/// 401 → [UnauthorizedFailure]; 409 → [ConflictFailure];
/// outros status → [ApiFailure]; sem resposta → [NetworkFailure].
class ValidationFailure extends ArgumentError {
  ValidationFailure(String super.message, {this.details = const []});

  /// Códigos da regra violada (`details` do corpo do 400/422), quando vierem.
  final List<String> details;
}

class NotFoundFailure extends StateError {
  NotFoundFailure(super.message);
}

/// Resposta de erro do backend sem mapeamento próprio (`{ statusCode, message }`).
class ApiFailure implements Exception {
  ApiFailure(this.statusCode, this.message);

  final int statusCode;
  final String message;

  @override
  String toString() => 'ApiFailure($statusCode): $message';
}

/// 401: sem token, token inválido/expirado ou credenciais erradas.
class UnauthorizedFailure extends ApiFailure {
  UnauthorizedFailure(String message) : super(401, message);
}

/// 409: conflito (e-mail já cadastrado).
class ConflictFailure extends ApiFailure {
  ConflictFailure(String message) : super(409, message);
}

/// Não chegou resposta do backend (sem rede, servidor fora do ar).
class NetworkFailure implements Exception {
  NetworkFailure(this.message);

  final String message;

  @override
  String toString() => 'NetworkFailure: $message';
}
