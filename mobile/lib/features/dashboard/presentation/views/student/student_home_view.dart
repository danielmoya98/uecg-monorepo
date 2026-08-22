import 'package:flutter/material.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../../../../core/widgets/swiss_header.dart';

class StudentHomeView extends StatelessWidget {
  const StudentHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        const SwissHeader(greeting: 'HOLA 👋', title: 'JUAN (3RO A)'),
        const SizedBox(height: 24),
        SwissCard(
          label: 'HORARIO DE HOY',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('08:00 – Matemática', style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.inkBlack)),
              const SizedBox(height: 8),
              Text('09:30 – Historia', style: textTheme.bodyLarge),
              const SizedBox(height: 8),
              Text('11:00 – Inglés', style: textTheme.bodyLarge),
            ],
          ),
        ),
        SwissCard(
          label: 'RENDIMIENTO ACADÉMICO',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('PROMEDIO GENERAL', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
              Text('8.2 / 10', style: textTheme.displayLarge?.copyWith(color: AppTheme.swissBlue)),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Matemática', style: textTheme.bodyLarge), Text('7.5', style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold))]),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Historia', style: textTheme.bodyLarge), Text('9.0', style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold))]),
            ],
          ),
        ),
        SwissCard(
          label: 'ASISTENCIA DEL MES',
          content: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('PRESENTES: 17', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack)),
              Text('FALTAS: 2', style: textTheme.bodyLarge?.copyWith(color: AppTheme.slateGray)),
            ],
          ),
        ),
      ],
    );
  }
}