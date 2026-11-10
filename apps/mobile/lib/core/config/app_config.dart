/// Configuração por ambiente, lida de `--dart-define-from-file=env/<ambiente>.json`.
///
/// Único lugar do app que conhece a URL do backend (regra em
/// `.agents/rules/mobile-flutter.md`).
class AppConfig {
  const AppConfig._();

  static const String envName = String.fromEnvironment(
    'ENV_NAME',
    defaultValue: 'local-simulator',
  );

  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:4000',
  );
}
