/// Erros que os repositórios devolvem às telas, espelhando o contrato:
/// 400/422 → [ValidationFailure]; 404 → [NotFoundFailure].
class ValidationFailure extends ArgumentError {
  ValidationFailure(String super.message);
}

class NotFoundFailure extends StateError {
  NotFoundFailure(super.message);
}
