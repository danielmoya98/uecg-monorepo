import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'app_theme.dart';

class SwissBackground extends StatelessWidget {
  final Widget child;

  const SwissBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 1. Capa geométrica animada (Rotación infinita ultra lenta)
        Positioned.fill(
          child: CustomPaint(
            painter: _SwissGeometryPainter(),
          ).animate(onPlay: (controller) => controller.repeat()).rotate(
              duration: 120.seconds, begin: 0, end: 1), // 2 minutos por vuelta
        ),

        // 2. Línea de retícula estática
        Positioned(
          left: 32.0,
          top: 0,
          bottom: 0,
          child: Container(
            width: 1,
            color: AppTheme.lineGray.withOpacity(0.3),
          ),
        ),

        // 3. Tu contenido UI principal
        child,
      ],
    );
  }
}

class _SwissGeometryPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final strokePaint = Paint()
      ..color = AppTheme.inkBlack.withOpacity(0.02) // Opacidad mínima
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final fillPaint = Paint()
      ..color = AppTheme.swissBlue.withOpacity(0.015)
      ..style = PaintingStyle.fill;

    // Círculo masivo descentrado (Eje de rotación)
    final center = Offset(size.width * 0.8, size.height * -0.1);
    canvas.drawCircle(center, size.width * 0.7, strokePaint);
    canvas.drawCircle(center, size.width * 0.65, strokePaint);

    // Cuadrado abstracto inferior
    canvas.drawRect(
      Rect.fromLTWH(-size.width * 0.2, size.height * 0.7, size.width * 0.6,
          size.width * 0.6),
      fillPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
