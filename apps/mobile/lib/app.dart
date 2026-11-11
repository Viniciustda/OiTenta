import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/di/app_dependencies.dart';
import 'core/routes/app_router.dart';
import 'core/routes/app_routes.dart';
import 'core/theme/app_theme.dart';

class BoraApp extends StatefulWidget {
  const BoraApp({
    super.key,
    required this.deps,
    this.initialLocation = AppRoutes.login,
  });

  final AppDependencies deps;
  final String initialLocation;

  @override
  State<BoraApp> createState() => _BoraAppState();
}

class _BoraAppState extends State<BoraApp> {
  late final GoRouter _router = createRouter(
    widget.deps,
    initialLocation: widget.initialLocation,
  );

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => MaterialApp.router(
    title: 'Bora',
    debugShowCheckedModeBanner: false,
    theme: AppTheme.light(),
    routerConfig: _router,
  );
}
