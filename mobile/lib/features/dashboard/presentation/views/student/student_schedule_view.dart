import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uecg_app/core/theme/app_theme.dart';
import 'package:uecg_app/features/timetables/presentation/providers/timetables_provider.dart';

class StudentScheduleView extends ConsumerWidget {
  const StudentScheduleView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textTheme = Theme.of(context).textTheme;
    final selectedDay = ref.watch(selectedScheduleDayProvider);
    final scheduleState = ref.watch(myScheduleProvider);
    final daySlots = ref.watch(filteredDayScheduleProvider);

    const days = [
      {'id': 1, 'label': 'LUN'},
      {'id': 2, 'label': 'MAR'},
      {'id': 3, 'label': 'MIE'},
      {'id': 4, 'label': 'JUE'},
      {'id': 5, 'label': 'VIE'},
      {'id': 6, 'label': 'SAB'},
    ];

    return RefreshIndicator(
      onRefresh: () => ref.read(myScheduleProvider.notifier).refresh(),
      color: AppTheme.swissBlue,
      child: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          Text('HORARIO SEMANAL', style: textTheme.labelSmall),
          const SizedBox(height: 24),
          Row(
            children: days.map((day) {
              final isSelected = day['id'] == selectedDay;
              return Expanded(
                child: GestureDetector(
                  onTap: () {
                    ref.read(selectedScheduleDayProvider.notifier).state = day['id'] as int;
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.swissBlue : AppTheme.pureWhite,
                      border: Border.all(color: AppTheme.lineGray, width: 1),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      day['label'] as String,
                      style: textTheme.labelSmall?.copyWith(
                        color: isSelected ? AppTheme.pureWhite : AppTheme.slateGray,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 32),
          scheduleState.when(
            data: (_) {
              if (daySlots.isEmpty) {
                return Container(
                  padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                  decoration: BoxDecoration(
                    color: AppTheme.pureWhite,
                    border: Border.all(color: AppTheme.lineGray),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.calendar_today_outlined, size: 36, color: AppTheme.slateGray.withValues(alpha: 0.5)),
                      const SizedBox(height: 12),
                      Text(
                        'NO HAY CLASES PROGRAMADAS PARA ESTE DÍA',
                        textAlign: TextAlign.center,
                        style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray),
                      ),
                    ],
                  ),
                );
              }

              return Column(
                children: daySlots.map((slot) {
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
                        top: const BorderSide(color: AppTheme.lineGray, width: 1),
                        right: const BorderSide(color: AppTheme.lineGray, width: 1),
                        bottom: const BorderSide(color: AppTheme.lineGray, width: 1),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
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
                              if (slot.teacherName != null && slot.teacherName!.isNotEmpty) ...[
                                const SizedBox(height: 2),
                                Text(
                                  'Prof. ${slot.teacherName}',
                                  style: textTheme.bodyMedium?.copyWith(
                                    color: AppTheme.slateGray,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                              const SizedBox(height: 4),
                              Text(
                                slot.locationName,
                                style: textTheme.bodyLarge?.copyWith(fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              );
            },
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: CircularProgressIndicator(color: AppTheme.swissBlue),
              ),
            ),
            error: (err, _) => Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                border: Border(left: BorderSide(color: Colors.red.shade700, width: 4)),
              ),
              child: Text(
                'No se pudo cargar el horario: $err',
                style: textTheme.bodyMedium?.copyWith(color: Colors.red.shade900),
              ),
            ),
          ),
        ],
      ),
    );
  }
}