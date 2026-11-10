import 'package:flutter/widgets.dart';

/// Cria o controlador da tela uma vez, chama [init] (ex.: `load()`), escuta as
/// mudanças e o descarta ao sair. A tela recebe o controlador já pronto.
class ControllerHost<T extends ChangeNotifier> extends StatefulWidget {
  const ControllerHost({super.key, required this.create, required this.builder, this.init, this.onDispose});

  final T Function() create;
  final void Function(T controller)? init;
  final void Function(T controller)? onDispose;
  final Widget Function(BuildContext context, T controller) builder;

  @override
  State<ControllerHost<T>> createState() => _ControllerHostState<T>();
}

class _ControllerHostState<T extends ChangeNotifier> extends State<ControllerHost<T>> {
  late final T controller = widget.create();

  @override
  void initState() {
    super.initState();
    widget.init?.call(controller);
  }

  @override
  void dispose() {
    widget.onDispose?.call(controller);
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      ListenableBuilder(listenable: controller, builder: (context, _) => widget.builder(context, controller));
}
