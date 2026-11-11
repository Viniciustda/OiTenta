import 'package:flutter/foundation.dart';

import '../data/goal_assistant_repository.dart';
import '../domain/goal_suggestion.dart';

/// Momento da conversa: vazia (M13), analisando (M14), respondida ou com
/// falha (decisão 4f: a tela abre o formulário manual).
enum GoalChatPhase { idle, analyzing, answered, failed }

/// Chat do novo objetivo (M13–M14): o usuário descreve o objetivo e a IA
/// devolve título, prazo e etapas, que a tela de etapas (M15) mostra
/// preenchidas para conferir e editar.
class GoalChatController extends ChangeNotifier {
  GoalChatController(this._repo);

  final GoalAssistantRepository _repo;
  bool _disposed = false;

  /// Texto do campo.
  String text = '';

  /// Mensagem já enviada (balão do usuário).
  String? sentText;
  GoalChatPhase phase = GoalChatPhase.idle;
  GoalSuggestion? suggestion;

  bool get canSend =>
      text.trim().isNotEmpty && phase != GoalChatPhase.analyzing;

  void setText(String v) {
    text = v;
    notifyListeners();
  }

  /// Envia a descrição. Devolve a sugestão, ou `null` se não havia o que
  /// enviar ou se a IA falhou ([phase] = [GoalChatPhase.failed]).
  Future<GoalSuggestion?> send() async {
    if (!canSend) return null;
    final description = text.trim();
    sentText = description;
    text = '';
    suggestion = null;
    phase = GoalChatPhase.analyzing;
    notifyListeners();
    try {
      suggestion = await _repo.suggest(description);
      phase = GoalChatPhase.answered;
      return suggestion;
    } catch (_) {
      phase = GoalChatPhase.failed;
      return null;
    } finally {
      // A tela pode ter sido fechada durante a análise.
      if (!_disposed) notifyListeners();
    }
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
