/// Tarefa leve da timeline do Hoje (M01; DATA `LEVES`).
///
/// **Só dados de exemplo:** as tarefas leves (UC13) não estão no contrato
/// desta fase. Ficam aqui para a timeline do Hoje seguir o design.
class LightTask {
  const LightTask({required this.id, required this.title, required this.subtitle, required this.time});

  final String id;
  final String title;
  final String subtitle;

  /// Horário mostrado na timeline (`HH:MM`).
  final String time;
}
