import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/app_dependencies.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/widgets/controller_host.dart';
import 'login_controller.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => ControllerHost<LoginController>(
    create: () => LoginController(deps.auth, deps.scheduling, deps.session),
    builder: (context, c) => LoginScreen(
      busy: c.busy,
      error: c.error,
      onContinue: () => context.go(AppRoutes.onboarding),
      onRegister: () => context.push(AppRoutes.register),
      onDemo: () async {
        final next = await c.enterDemo();
        if (!context.mounted || next == null) return;
        context.go(
          next == AfterLogin.today ? AppRoutes.today : AppRoutes.onboarding,
        );
      },
    ),
  );
}

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) => RegisterScreen(
    onBack: () =>
        context.canPop() ? context.pop() : context.go(AppRoutes.login),
    onContinue: () => context.go(AppRoutes.onboarding),
  );
}
