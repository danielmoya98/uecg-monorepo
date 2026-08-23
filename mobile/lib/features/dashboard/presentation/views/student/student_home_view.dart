import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uecg_app/core/theme/app_theme.dart';
import 'package:uecg_app/core/widgets/swiss_card.dart';
import 'package:uecg_app/core/widgets/swiss_header.dart';
import 'package:uecg_app/features/timetables/presentation/providers/timetables_provider.dart';

class StudentHomeView extends ConsumerWidget {
  const StudentHomeView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textTheme = Theme.of(context).textTheme;
    final todayScheduleState = ref.watch(todayScheduleProvider);

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        const SwissHeader(greeting: 'HOLA 👋', title: 'ESTUDIANTE'),
        const SizedBox(height: 24),
        SwissCard(
          label: 'HORARIO DE HOY',
          content: todayScheduleState.when(
            data: (slots) {
              if (slots.isEmpty) {
                return Text(
                  'No tienes clases programadas para hoy.',
                  style: textTheme.bodyMedium?.copyWith(color: AppTheme.slateGray),
                );
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: slots.take(4).map((slot) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${slot.startTime} – ${slot.subjectName}',
                            style: textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppTheme.inkBlack,
                            ),
                          ),
                        ),
                        Text(
                          slot.locationName,
                          style: textTheme.bodyMedium?.copyWith(
                            color: AppTheme.slateGray,
                            fontSize: 12,
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
                padding: EdgeInsets.all(8.0),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.swissBlue),
                ),
              ),
            ),
            error: (_, __) => Text(
              'No se pudo cargar el horario de hoy.',
              style: textTheme.bodyMedium?.copyWith(color: Colors.red.shade700),
            ),
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