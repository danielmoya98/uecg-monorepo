import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

class SwissCard extends StatelessWidget {
  final String label;
  final Widget content;
  final String? actionText;
  final VoidCallback? onAction;
  final int index; // 🔥 Añadido para la coreografía de entrada

  const SwissCard({
    super.key,
    required this.label,
    required this.content,
    this.actionText,
    this.onAction,
    this.index = 0,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
          color: AppTheme.pureWhite,
          border: Border.all(color: AppTheme.lineGray, width: 1),
          // 🔥 Sombra ultraligera para separar del fondo sin perder la estética plana
          boxShadow: [
            BoxShadow(
              color: AppTheme.inkBlack.withOpacity(0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ]),
      padding: const EdgeInsets.all(24.0),
      margin: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 🔥 Acento Geométrico Suizo
          Row(
            children: [
              Container(width: 6, height: 6, color: AppTheme.swissBlue),
              const SizedBox(width: 8),
              Text(label, style: textTheme.labelSmall),
            ],
          ),
          const SizedBox(height: 16),
          content,
          if (actionText != null && onAction != null) ...[
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.swissBlue,
                  shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.zero),
                  side: const BorderSide(
                      color: AppTheme.swissBlue,
                      width: 1.5), // Borde un poco más grueso
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: onAction,
                child: Text(actionText!),
              ),
            ),
          ]
        ],
      ),
    )
        // 🔥 Coreografía de entrada: Calcula el retraso basado en el índice de la lista
        .animate()
        .fade(delay: (100 * index).ms, duration: 400.ms)
        .slideY(begin: 0.1, curve: Curves.easeOutQuart);
  }
}
