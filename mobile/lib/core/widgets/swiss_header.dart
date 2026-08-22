import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

class SwissHeader extends StatelessWidget {
  final String greeting;
  final String title;
  final Widget? trailing;

  const SwissHeader({
    super.key,
    required this.greeting,
    required this.title,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.only(bottom: 24.0, top: 16.0),
      child: Stack(
        children: [
          // 🔥 Línea base animada (Crece de izquierda a derecha)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 1,
              color: AppTheme.lineGray,
            ).animate().scaleX(
                alignment: Alignment.centerLeft,
                duration: 800.ms,
                curve: Curves.easeOutCirc),
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(greeting,
                            style: textTheme.labelSmall
                                ?.copyWith(color: AppTheme.slateGray))
                        .animate()
                        .fade(duration: 500.ms)
                        .slideX(begin: -0.05),
                    const SizedBox(
                        height: 4), // Ajuste milimétrico del interlineado
                    Text(title,
                            style:
                                textTheme.displayLarge?.copyWith(fontSize: 28))
                        .animate()
                        .fade(delay: 200.ms, duration: 600.ms)
                        .slideX(begin: -0.05, curve: Curves.easeOutQuart),
                  ],
                ),
              ),
              if (trailing != null)
                trailing!
                    .animate()
                    .fade(delay: 400.ms)
                    .scaleXY(begin: 0.9, curve: Curves.easeOutBack),
            ],
          ),
        ],
      ),
    );
  }
}
