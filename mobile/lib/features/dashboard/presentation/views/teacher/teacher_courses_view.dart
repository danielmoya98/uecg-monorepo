import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';

class TeacherCoursesView extends StatelessWidget {
  const TeacherCoursesView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        Text('CURSOS ASIGNADOS', style: textTheme.labelSmall),
        const SizedBox(height: 24),
        SwissCard(
          label: 'MATEMÁTICA - 3RO A',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('ESTUDIANTES', style: textTheme.bodyLarge), Text('30', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold))]),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('PROMEDIO GENERAL', style: textTheme.bodyLarge), Text('7.6 / 10', style: textTheme.bodyLarge?.copyWith(color: AppTheme.swissBlue, fontWeight: FontWeight.bold))]),
            ],
          ),
          actionText: 'VER ESTUDIANTES Y NOTAS',
          onAction: () => context.push('/course-detail'),
        ),
        SwissCard(
          label: 'MATEMÁTICA - 4TO B',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('ESTUDIANTES', style: textTheme.bodyLarge), Text('28', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold))]),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('PROMEDIO GENERAL', style: textTheme.bodyLarge), Text('8.1 / 10', style: textTheme.bodyLarge?.copyWith(color: AppTheme.swissBlue, fontWeight: FontWeight.bold))]),
            ],
          ),
          actionText: 'VER ESTUDIANTES Y NOTAS',
          onAction: () => context.push('/course-detail'),
        ),
      ],
    );
  }
}