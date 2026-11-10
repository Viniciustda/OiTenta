import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../theme/bora_colors.dart';
import '../theme/bora_text.dart';

/// Abas do app (tab bar do protótipo): Hoje, Objetivos, Semana, Jardim.
enum AppTab { today, goals, week, garden }

/// Moldura das telas logadas: conteúdo + tab bar.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.child, required this.current, required this.onTab});

  final Widget child;
  final AppTab current;
  final ValueChanged<AppTab> onTab;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Scaffold(
      backgroundColor: c.bg,
      body: child,
      bottomNavigationBar: BoraTabBar(current: current, onTab: onTab),
    );
  }
}

class BoraTabBar extends StatelessWidget {
  const BoraTabBar({super.key, required this.current, required this.onTab});

  final AppTab current;
  final ValueChanged<AppTab> onTab;

  static const _tabs = [
    (AppTab.today, 'Hoje', PhosphorIconsRegular.sun, PhosphorIconsFill.sun),
    (AppTab.goals, 'Objetivos', PhosphorIconsRegular.flagBanner, PhosphorIconsFill.flagBanner),
    (AppTab.week, 'Semana', PhosphorIconsRegular.calendarBlank, PhosphorIconsFill.calendarBlank),
    (AppTab.garden, 'Jardim', PhosphorIconsRegular.plant, PhosphorIconsFill.plant),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Container(
      decoration: BoxDecoration(color: c.surface, border: Border(top: BorderSide(color: c.border))),
      padding: EdgeInsets.fromLTRB(8, 8, 8, bottom > 0 ? bottom - 4 : 12),
      child: Row(
        children: [
          for (final (tab, label, icon, iconFill) in _tabs)
            Expanded(
              child: Semantics(
                button: true,
                selected: tab == current,
                label: label,
                excludeSemantics: true,
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onTab(tab),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 56,
                        height: 32,
                        decoration: BoxDecoration(
                          color: tab == current ? c.priSoft : c.surface.withValues(alpha: 0),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        alignment: Alignment.center,
                        child: Icon(tab == current ? iconFill : icon, size: 24, color: tab == current ? c.pri : c.tx2),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        label,
                        style: BoraText.nunito(12, 16,
                            weight: tab == current ? FontWeight.w800 : FontWeight.w600,
                            color: tab == current ? c.tx : c.tx2),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
