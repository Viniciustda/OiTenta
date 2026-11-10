import 'package:flutter/material.dart';

import '../theme/bora_colors.dart';
import '../theme/bora_text.dart';

/// Campo de texto do protótipo: raio 12, borda 2px `--border`, focado `--blue`.
class BoraInput extends StatefulWidget {
  const BoraInput({
    super.key,
    required this.value,
    required this.onChanged,
    required this.hint,
    this.height = 52,
    this.keyboardType,
    this.style,
    this.semanticLabel,
  });

  final String value;
  final ValueChanged<String> onChanged;
  final String hint;
  final double height;
  final TextInputType? keyboardType;
  final TextStyle? style;
  final String? semanticLabel;

  @override
  State<BoraInput> createState() => _BoraInputState();
}

class _BoraInputState extends State<BoraInput> {
  late final TextEditingController _text = TextEditingController(text: widget.value);

  @override
  void didUpdateWidget(covariant BoraInput old) {
    super.didUpdateWidget(old);
    if (widget.value != _text.text) _text.text = widget.value;
  }

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    OutlineInputBorder border(Color color) =>
        OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: color, width: 2));
    return SizedBox(
      height: widget.height,
      child: TextField(
        controller: _text,
        onChanged: widget.onChanged,
        keyboardType: widget.keyboardType,
        style: widget.style ?? BoraText.nunito(15, 20, color: c.tx),
        decoration: InputDecoration(
          hintText: widget.hint,
          labelText: null,
          semanticCounterText: widget.semanticLabel,
          hintStyle: (widget.style ?? BoraText.nunito(15, 20, color: c.tx2)).copyWith(color: c.tx2),
          filled: true,
          fillColor: c.surface,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          enabledBorder: border(c.border),
          focusedBorder: border(c.blue),
          border: border(c.border),
        ),
      ),
    );
  }
}
