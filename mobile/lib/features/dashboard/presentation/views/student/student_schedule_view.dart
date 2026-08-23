import 'package:flutter/material.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../data/models/schedule_slot_model.dart';

class StudentScheduleView extends StatelessWidget {
  const StudentScheduleView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final schedule = [
      const ScheduleSlotModel(
        id: '1',
        dayOfWeek: 2,
        startTime: '08:00',
        endTime: '09:30',
        subjectName: 'Matemática',
        physicalSpaceName: 'Aula 12',
      ),
      const ScheduleSlotModel(
        id: '2',
        dayOfWeek: 2,
        startTime: '09:30',
        endTime: '11:00',
        subjectName: 'Historia',
        physicalSpaceName: 'Aula 14',
      ),
      const ScheduleSlotModel(
        id: '3',
        dayOfWeek: 2,
        startTime: '11:00',
        endTime: '11:30',
        subjectName: 'RECREO',
        physicalSpaceName: 'Patio Central',
        isBreak: true,
      ),
      const ScheduleSlotModel(
        id: '4',
        dayOfWeek: 2,
        startTime: '11:30',
        endTime: '13:00',
        subjectName: 'Inglés',
        physicalSpaceName: 'Laboratorio B',
      ),
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
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.swissBlue : AppTheme.pureWhite,
                  border: Border.all(color: AppTheme.lineGray, width: 1),
                ),
                alignment: Alignment.center,
                child: Text(
                  day,
                  style: textTheme.labelSmall?.copyWith(
                    color: isSelected ? AppTheme.pureWhite : AppTheme.slateGray,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 32),
        ...schedule.map((slot) {
          final isBreak = slot.isBreak;
          return Container(
            margin: const EdgeInsets.only(bottom: 16.0),
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: isBreak ? AppTheme.lineGray.withValues(alpha: 0.3) : AppTheme.pureWhite,
              border: Border(
                left: BorderSide(
                  color: isBreak ? AppTheme.slateGray : AppTheme.swissBlue,
                  width: 4,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  slot.timeRange,
                  style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray),
                ),
                const SizedBox(height: 4),
                Text(
                  slot.subjectName,
                  style: textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppTheme.inkBlack,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  slot.locationName,
                  style: textTheme.bodyLarge?.copyWith(fontSize: 12),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}