import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../../../../core/widgets/swiss_header.dart';

class TeacherHomeView extends StatelessWidget {
  const TeacherHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        const SwissHeader(greeting: 'BUENOS DÍAS 👋', title: 'PROF. CARLOS'),
        const SizedBox(height: 24),
        SwissCard(
          label: 'HORARIO DE HOY - 12 MARZO',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('08:00 – Matemática – 3ro A', style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.inkBlack)),
              const SizedBox(height: 8),
              Text('09:30 – Matemática – 4to B', style: textTheme.bodyLarge),
              const SizedBox(height: 8),
              Text('11:00 – Matemática – 3ro B', style: textTheme.bodyLarge),
            ],
          ),
          actionText: 'TOMAR ASISTENCIA (QR)',
          onAction: () => context.push('/attendance/qr'),
        ),
        SwissCard(
          label: 'ALERTAS ACADÉMICAS',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Juan Pérez – promedio 5.8', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack)),
              const SizedBox(height: 4),
              Text('Ana López – 4 faltas seguidas', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack)),
            ],
          ),
          actionText: 'VER ESTUDIANTES',
          onAction: () {},
        ),
      ],
    );
  }
}