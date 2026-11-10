import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../../../core/widgets/broto.dart';
import '../domain/availability.dart';
import 'onboarding_controller.dart';

/// Respostas do T01 (protótipo `Bora Telas`, prancheta 1a).
const stuckAnswers = ['Começar', 'Saber por onde ir', 'Manter o foco', 'Prazo em cima', 'Um pouco de tudo'];

/// Onboarding (T01–T03 + placeholders dos passos 1, 3 e 6, P27).
class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({
    super.key,
    required this.state,
    required this.onBack,
    required this.onNext,
    required this.onStuck,
    required this.onTogglePeriod,
    required this.onLimit,
    required this.onSave,
    required this.onFinish,
  });

  final OnboardingController state;
  final VoidCallback onBack;
  final VoidCallback onNext;
  final ValueChanged<String> onStuck;
  final void Function(int column, FreePeriod period) onTogglePeriod;
  final ValueChanged<int> onLimit;
  final VoidCallback onSave;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final bottom = MediaQuery.paddingOf(context).bottom;
    Widget? footer;
    late Widget body;
    switch (state.step) {
      case 2:
        body = _Welcome(name: state.userName, onStuck: onStuck);
      case 4:
        body = _Grid(state: state, onToggle: onTogglePeriod);
        footer = PrimaryButton(label: 'Continuar', onPressed: state.canContinueGrid ? onNext : null);
      case 5:
        body = _Limit(state: state, onLimit: onLimit);
        footer = PrimaryButton(label: 'Continuar', onPressed: state.saving ? null : onSave);
      case 6:
        body = const _Placeholder(title: 'Tudo pronto', text: 'Passo 6 de 6: fechamento do onboarding.');
        footer = PrimaryButton(label: 'Ir para o Hoje', onPressed: onFinish);
      default:
        body = _Placeholder(
          title: state.step == 1 ? 'Primeira pergunta' : 'Mais uma pergunta',
          text: 'Passo ${state.step} de 6.',
        );
        footer = PrimaryButton(label: 'Continuar', onPressed: onNext);
    }
    return Scaffold(
      backgroundColor: c.bgSoft,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _Header(step: state.step, progress: state.progress, onBack: onBack),
            Expanded(child: body),
            if (state.error != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(state.error!, style: BoraText.small(c.danger)),
              ),
            if (footer != null) Padding(padding: EdgeInsets.fromLTRB(20, 12, 20, 8 + bottom), child: footer),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.step, required this.progress, required this.onBack});

  final int step;
  final double progress;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return SizedBox(
      height: 52,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 0, 20, 0),
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Voltar',
              child: GestureDetector(
                onTap: onBack,
                child: SizedBox(
                  width: 44,
                  height: 44,
                  child: Icon(PhosphorIconsRegular.caretLeft, size: 24, color: c.tx2),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(child: ProgressBar(value: progress, color: c.fill, height: 4)),
            const SizedBox(width: 8),
            SizedBox(
              width: 40,
              child: Text('$step de 6',
                  textAlign: TextAlign.right, style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
            ),
          ],
        ),
      ),
    );
  }
}

/// Linha do chat: avatar do Broto (ou espaço) + balão.
class _BrotoLine extends StatelessWidget {
  const _BrotoLine({required this.child, this.mood, this.topPad = 0});

  final Widget child;
  final BrotoMood? mood;
  final double topPad;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: topPad),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          SizedBox(width: 40, child: mood == null ? null : Broto(mood: mood!, size: 40)),
          const SizedBox(width: 8),
          ConstrainedBox(constraints: const BoxConstraints(maxWidth: 272), child: BrotoBubble(child: child)),
        ],
      ),
    );
  }
}

class _UserPill extends StatelessWidget {
  const _UserPill(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(color: c.pri, borderRadius: BorderRadius.circular(999)),
        child: Text(text, style: BoraText.nunito(15, 20, weight: FontWeight.w800, color: c.priTx)),
      ),
    );
  }
}

class _Welcome extends StatelessWidget {
  const _Welcome({required this.name, required this.onStuck});

  final String name;
  final ValueChanged<String> onStuck;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _BrotoLine(
            mood: BrotoMood.animado,
            child: Text.rich(TextSpan(children: [
              const TextSpan(text: 'Oi! Eu sou o '),
              TextSpan(text: 'Broto', style: BoraText.fredoka(15, 22, color: c.tx)),
              const TextSpan(text: '. Vamos montar seu plano sem drama?'),
            ])),
          ),
          const SizedBox(height: 12),
          const _UserPill('Bora!'),
          const SizedBox(height: 12),
          _BrotoLine(
            topPad: 4,
            child: Text('Fechado${name.isEmpty ? '' : ', $name'}. São 6 perguntas rápidas e dá pra mudar tudo depois.'),
          ),
          const SizedBox(height: 12),
          const _BrotoLine(mood: BrotoMood.ok, child: Text('O que mais te trava na hora de estudar?')),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text('ESCOLHA UMA', textAlign: TextAlign.right, style: BoraText.label(c.tx2)),
          ),
          const SizedBox(height: 8),
          Wrap(
            alignment: WrapAlignment.end,
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final a in stuckAnswers)
                Semantics(
                  button: true,
                  child: GestureDetector(
                    onTap: () => onStuck(a),
                    child: Container(
                      height: 44,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: c.surface,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: c.border, width: 2),
                      ),
                      alignment: Alignment.center,
                      child: Text(a, style: BoraText.nunito(15, 15, weight: FontWeight.w800, color: c.blue)),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Grid extends StatelessWidget {
  const _Grid({required this.state, required this.onToggle});

  final OnboardingController state;
  final void Function(int column, FreePeriod period) onToggle;

  static const _days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  static const _periods = [
    (FreePeriod.morning, 'Manhã', '6h–12h', PhosphorIconsRegular.sunHorizon),
    (FreePeriod.afternoon, 'Tarde', '12h–18h', PhosphorIconsRegular.sun),
    (FreePeriod.night, 'Noite', '18h–23h', PhosphorIconsRegular.moon),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (state.stuckAnswer != null) ...[_UserPill(state.stuckAnswer!), const SizedBox(height: 12)],
          const _BrotoLine(topPad: 4, child: Text('Anotado. Eu quebro tudo em degraus pequenos pra você.')),
          const SizedBox(height: 12),
          const _BrotoLine(mood: BrotoMood.ok, child: Text('Quando costuma sobrar um tempo livre? Toca nos períodos.')),
          const SizedBox(height: 24),
          Row(children: [
            for (var i = 0; i < 7; i++) ...[
              if (i > 0) const SizedBox(width: 6),
              Expanded(child: Text(_days[i], textAlign: TextAlign.center, style: BoraText.label(c.tx2))),
            ],
          ]),
          for (final (period, label, range, icon) in _periods) ...[
            Padding(
              padding: EdgeInsets.only(top: period == FreePeriod.morning ? 12 : 14, bottom: 8),
              child: Row(children: [
                Icon(icon, size: 16, color: c.tx2),
                const SizedBox(width: 6),
                Text(label.toUpperCase(), style: BoraText.label(c.tx2)),
                const SizedBox(width: 6),
                Text(range, style: BoraText.caption(c.tx2)),
              ]),
            ),
            Row(children: [
              for (var col = 0; col < 7; col++) ...[
                if (col > 0) const SizedBox(width: 6),
                Expanded(
                  child: Semantics(
                    button: true,
                    selected: state.isSelected(col, period),
                    label: '${_days[col]} $label',
                    child: GestureDetector(
                      onTap: () => onToggle(col, period),
                      child: Container(
                        height: 48,
                        decoration: BoxDecoration(
                          color: state.isSelected(col, period) ? c.priSoft : c.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: state.isSelected(col, period) ? c.pri : c.border, width: 2),
                        ),
                        alignment: Alignment.center,
                        child: state.isSelected(col, period)
                            ? Icon(PhosphorIconsBold.check, size: 18, color: c.pri)
                            : null,
                      ),
                    ),
                  ),
                ),
              ],
            ]),
          ],
          const SizedBox(height: 18),
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: c.blueSoft, borderRadius: BorderRadius.circular(999)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(PhosphorIconsRegular.clock, size: 16, color: c.blue),
                const SizedBox(width: 6),
                Text(
                  '${state.periodCount} ${state.periodCount == 1 ? 'período' : 'períodos'} · cerca de ${state.approxHours}h livres por semana',
                  style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.blue),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _Limit extends StatelessWidget {
  const _Limit({required this.state, required this.onLimit});

  final OnboardingController state;
  final ValueChanged<int> onLimit;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _UserPill('${state.periodCount} ${state.periodCount == 1 ? 'período livre' : 'períodos livres'}'),
          const SizedBox(height: 12),
          _BrotoLine(
              topPad: 4, child: Text('Boa, deu umas ${state.approxHours}h por semana. Não vou usar tudo.')),
          const SizedBox(height: 12),
          const _BrotoLine(
              mood: BrotoMood.ok, child: Text('Qual o máximo de estudo por dia que ainda fica leve pra você?')),
          const SizedBox(height: 28),
          BoraCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('MÁXIMO POR DIA', style: BoraText.label(c.tx2)),
                const SizedBox(height: 4),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text('${state.limitHours}h', style: BoraText.fredoka(44, 52, color: c.tx)),
                    const SizedBox(width: 8),
                    Text('por dia', style: BoraText.small(c.tx2)),
                  ],
                ),
                const SizedBox(height: 20),
                BoraSlider(
                  value: state.limitHours.toDouble(),
                  min: 1,
                  max: 8,
                  step: 1,
                  semanticLabel: 'Máximo por dia',
                  onChanged: (v) => onLimit(v.round()),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    for (var h = 1; h <= 8; h++)
                      Text('${h}h',
                          style: h == state.limitHours
                              ? BoraText.nunito(12, 16, weight: FontWeight.w800, color: c.pri)
                              : BoraText.caption(c.tx2)),
                  ],
                ),
                const SizedBox(height: 20),
                Container(height: 1, color: c.border),
                const SizedBox(height: 20),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 1),
                      child: Icon(PhosphorIconsRegular.shieldCheck, size: 20, color: c.pri),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text('Eu nunca passo desse limite. Se não couber, te aviso antes do prazo apertar.',
                          style: BoraText.small(c.tx2)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder({required this.title, required this.text});

  final String title;
  final String text;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Broto(mood: BrotoMood.ok, size: 72),
          const SizedBox(height: 16),
          Text(title, style: BoraText.h1(c.tx)),
          const SizedBox(height: 4),
          Text(text, style: BoraText.small(c.tx2)),
          const SizedBox(height: 8),
          Text('Tela provisória: ainda sem design.', style: BoraText.caption(c.tx2)),
        ],
      ),
    );
  }
}
