import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import 'ladder_controller.dart';

/// Escada do protótipo: 214 de altura, com 30 no topo para a tag
/// "Sugerido pra você"; degraus de 108 + 19·i, separados por 6.
const _ladderHeight = 214.0;
const _tagSpace = 30.0;
const _stepGap = 6.0;
double _stepHeight(int i) => 108.0 + i * 19;

/// Escada da rampa (M06).
class LadderScreen extends StatelessWidget {
  const LadderScreen({
    super.key,
    required this.state,
    required this.onClose,
    required this.onSelect,
    required this.onSwap,
    required this.onSkip,
    required this.onStart,
  });

  final LadderController state;
  final VoidCallback onClose;
  final ValueChanged<int> onSelect;
  final VoidCallback onSwap;
  final VoidCallback onSkip;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final steps = state.steps;
    final opt = state.currentOption;
    return BoraPage(
      topBar: BoraTopBar(leading: CloseNavButton(onPressed: onClose)),
      children: [
        Text('Sua rampa tá pronta', style: BoraText.h1(c.tx)),
        const SizedBox(height: 2),
        Text(state.subtitle, style: BoraText.small(c.tx2)),
        const SizedBox(height: 8),
        SizedBox(
          height: _ladderHeight,
          child: LayoutBuilder(
            builder: (context, box) {
              final n = steps.length;
              final stepWidth = (box.maxWidth - _stepGap * (n - 1)) / n;
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  Positioned.fill(
                    top: _tagSpace,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        for (var i = 0; i < n; i++) ...[
                          if (i > 0) const SizedBox(width: _stepGap),
                          Expanded(
                            child: _Step(
                              view: steps[i],
                              height: _stepHeight(i),
                              onTap: () => onSelect(i),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  // A tag fica numa camada acima de todos os degraus (no
                  // protótipo, `z-index` do degrau sugerido): a do 1º degrau
                  // se estende sobre o 2º sem ser coberta. Como no protótipo,
                  // ela faz parte do degrau: tocar nela escolhe o sugerido.
                  for (var i = 0; i < n; i++)
                    if (steps[i].suggested)
                      Positioned(
                        bottom: _stepHeight(i) + 6,
                        left: i == 0 ? 0 : null,
                        right: i == 0
                            ? null
                            : box.maxWidth -
                                  (i * (stepWidth + _stepGap) + stepWidth),
                        child: _SuggestedTag(onTap: () => onSelect(i)),
                      ),
                ],
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        Text(
          state.caption,
          style: BoraText.nunito(14, 20, weight: FontWeight.w700, color: c.tx),
        ),
        const SizedBox(height: 4),
        Transform.translate(
          offset: const Offset(-10, 0),
          child: Row(
            children: [
              if (state.canSwap)
                TertiaryButton(
                  label: 'Trocar',
                  icon: PhosphorIconsBold.arrowsClockwise,
                  compact: true,
                  onPressed: onSwap,
                ),
              const SizedBox(width: 4),
              if (state.canSkip)
                TertiaryButton(
                  label: 'Pular pra tarefa',
                  icon: PhosphorIconsBold.skipForward,
                  compact: true,
                  onPressed: onSkip,
                ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        BoraCard(
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: c.s2,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Icon(boraIcon(opt.icon), size: 24, color: c.pri),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(opt.title, style: BoraText.h3(c.tx)),
                    const SizedBox(height: 2),
                    Text(opt.description, style: BoraText.small(c.tx2)),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        PrimaryButton(label: 'Começar daqui', onPressed: onStart),
      ],
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({required this.view, required this.height, required this.onTap});

  final LadderStepView view;
  final double height;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    var bg = c.surface;
    var fg = c.tx;
    Border? border = Border.all(color: c.border);
    List<BoxShadow> shadow = const [];
    var icon = boraIcon(rampStepIcons[view.kind.index]);
    var opacity = 1.0;
    if (view.done) {
      bg = c.priSoft;
      fg = c.pri;
      border = null;
      icon = PhosphorIconsBold.check;
    } else if (view.current) {
      bg = c.pri;
      fg = c.priTx;
      border = null;
      shadow = [BoxShadow(color: c.lip, offset: const Offset(0, 3))];
      icon = boraIcon(rampStepIcons[view.kind.index], fill: true);
    } else if (view.skipped) {
      fg = c.tx2;
      opacity = .55;
    }
    return Semantics(
      button: true,
      selected: view.current,
      label: view.name,
      child: GestureDetector(
        onTap: onTap,
        child: Opacity(
          opacity: opacity,
          child: Container(
            height: height,
            padding: EdgeInsets.symmetric(
              horizontal: border == null ? 8 : 7,
              vertical: border == null ? 10 : 9,
            ),
            decoration: BoxDecoration(
              color: bg,
              border: border,
              boxShadow: shadow,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(8),
                bottomRight: Radius.circular(8),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, size: 22, color: fg),
                const SizedBox(height: 6),
                Text(
                  view.name == 'Micro-passo'
                      ? 'Micro-\npasso'
                      : (view.name == 'Registrar' ? 'Regis-\ntrar' : view.name),
                  softWrap: false,
                  overflow: TextOverflow.visible,
                  style: BoraText.nunito(
                    12,
                    16,
                    weight: FontWeight.w800,
                    color: fg,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  view.duration,
                  style: BoraText.caption(fg.withValues(alpha: .85)),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(PhosphorIconsFill.drop, size: 12, color: fg),
                    const SizedBox(width: 2),
                    Text('+5', style: BoraText.fredoka(12, 16, color: fg)),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Tag "Sugerido pra você" do degrau sugerido (P14).
class _SuggestedTag extends StatelessWidget {
  const _SuggestedTag({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
        decoration: BoxDecoration(
          color: c.priSoft,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          'Sugerido pra você',
          softWrap: false,
          style: BoraText.nunito(12, 16, weight: FontWeight.w800, color: c.pri),
        ),
      ),
    );
  }
}
