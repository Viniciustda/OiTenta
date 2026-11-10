import 'package:flutter/material.dart';

import '../../../core/widgets/bora_scaffold.dart';

/// Cadastro (placeholder, P27): nome da tela e botão que avança.
class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key, required this.onContinue, required this.onBack});

  final VoidCallback onContinue;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) => PlaceholderScreen(
        topBar: BoraTopBar(leading: BackNavButton(onPressed: onBack)),
        title: 'Cadastro',
        description: 'Nome, e-mail e senha.',
        actionLabel: 'Continuar',
        onAction: onContinue,
      );
}
