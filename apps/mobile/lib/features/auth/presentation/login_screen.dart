import 'package:flutter/material.dart';

import '../../../core/widgets/bora_scaffold.dart';

/// Entrar (placeholder, P27): nome da tela, botão que avança e o botão de demo.
class LoginScreen extends StatelessWidget {
  const LoginScreen({
    super.key,
    required this.busy,
    required this.error,
    required this.onContinue,
    required this.onDemo,
    required this.onRegister,
  });

  final bool busy;
  final String? error;
  final VoidCallback onContinue;
  final VoidCallback onDemo;
  final VoidCallback onRegister;

  @override
  Widget build(BuildContext context) {
    return PlaceholderScreen(
      title: 'Entrar',
      description: error ?? 'Login com e-mail e senha.',
      actionLabel: 'Continuar',
      onAction: busy ? null : onContinue,
      secondaryLabel: 'Entrar direto como Arthur (demo)',
      onSecondary: busy ? null : onDemo,
      tertiaryLabel: 'Criar conta',
      onTertiary: onRegister,
    );
  }
}
