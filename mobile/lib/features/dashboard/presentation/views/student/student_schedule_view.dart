import 'package:flutter/material.dart';
import '../../../../../core/theme/app_theme.dart';

class StudentScheduleView extends StatelessWidget {
  const StudentScheduleView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final schedule = [
      {'time': '08:00 - 09:30', 'subject': 'Matemática', 'room': 'Aula 12'},
      {'time': '09:30 - 11:00', 'subject': 'Historia', 'room': 'Aula 14'},
      {'time': '11:00 - 11:30', 'subject': 'RECREO', 'room': 'Patio Central'},
      {'time': '11:30 - 13:00', 'subject': 'Inglés', 'room': 'Laboratorio B'},
    ];

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        Text('HORARIO SEMANAL', style: textTheme.labelSmall),
        const SizedBox(height: 24),
        Row(
          children: ['LUN', 'MAR', 'MIE', 'JUE', 'VIE'].map((day) {
            final isSelected = day == 'MAR';
            return Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(color: isSelected ? AppTheme.swissBlue : AppTheme.pureWhite, border: Border.all(color: AppTheme.lineGray, width: 1)),
                alignment: Alignment.center,
                child: Text(day, style: textTheme.labelSmall?.copyWith(color: isSelected ? AppTheme.pureWhite : AppTheme.slateGray)),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 32),
        ...schedule.map((slot) {
          final isBreak = slot['subject'] == 'RECREO';
          return Container(
            margin: const EdgeInsets.only(bottom: 16.0),
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(color: isBreak ? AppTheme.lineGray.withOpacity(0.3) : AppTheme.pureWhite, border: Border(left: BorderSide(color: isBreak ? AppTheme.slateGray : AppTheme.swissBlue, width: 4))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(slot['time']!, style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
                const SizedBox(height: 4),
                Text(slot['subject']!, style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.inkBlack)),
                const SizedBox(height: 4),
                Text(slot['room']!, style: textTheme.bodyLarge?.copyWith(fontSize: 12)),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }
}