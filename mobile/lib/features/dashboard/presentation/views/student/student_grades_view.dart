import 'package:flutter/material.dart';
import '../../../../../core/theme/app_theme.dart';

class StudentGradesView extends StatelessWidget {
  const StudentGradesView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final grades = [
      {'subject': 'Matemática', 'grade': 7.5},
      {'subject': 'Historia', 'grade': 9.0},
      {'subject': 'Inglés', 'grade': 8.1},
      {'subject': 'Física', 'grade': 5.8},
      {'subject': 'Química', 'grade': 8.5},
    ];

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        Text('BOLETÍN DE CALIFICACIONES', style: textTheme.labelSmall),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(24.0),
          decoration: BoxDecoration(color: AppTheme.swissBlue.withOpacity(0.05), border: Border.all(color: AppTheme.swissBlue, width: 2)),
          child: Column(
            children: [
              Text('PROMEDIO ANUAL', style: textTheme.labelSmall),
              const SizedBox(height: 8),
              Text('8.2', style: textTheme.displayLarge?.copyWith(fontSize: 48, color: AppTheme.swissBlue)),
            ],
          ),
        ),
        const SizedBox(height: 32),
        Text('DETALLE POR MATERIA', style: textTheme.labelSmall),
        const SizedBox(height: 16),
        ...grades.map((item) {
          final isFailing = (item['grade'] as double) < 6.0;
          return Container(
            margin: const EdgeInsets.only(bottom: 8.0),
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(border: Border.all(color: AppTheme.lineGray, width: 1)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(item['subject'] as String, style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(color: isFailing ? Colors.red.shade50 : AppTheme.pureWhite, border: Border.all(color: isFailing ? Colors.red.shade800 : AppTheme.lineGray, width: 1)),
                  child: Text((item['grade'] as double).toStringAsFixed(1), style: textTheme.bodyLarge?.copyWith(color: isFailing ? Colors.red.shade800 : AppTheme.inkBlack, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }
}