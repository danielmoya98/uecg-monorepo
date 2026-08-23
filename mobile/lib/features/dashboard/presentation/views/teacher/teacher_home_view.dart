import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uecg_app/core/theme/app_theme.dart';
import 'package:uecg_app/core/widgets/swiss_card.dart';
import 'package:uecg_app/core/widgets/swiss_header.dart';
import 'package:uecg_app/features/timetables/presentation/providers/timetables_provider.dart';

class TeacherHomeView extends ConsumerWidget {
  const TeacherHomeView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textTheme = Theme.of(context).textTheme;
    final todayScheduleState = ref.watch(todayScheduleProvider);

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        const SwissHeader(greeting: 'BUENOS DÍAS 👋', title: 'DOCENTE'),
        const SizedBox(height: 24),
        SwissCard(
          label: 'HORARIO DE HOY',
          content: todayScheduleState.when(
            data: (slots) {
              if (slots.isEmpty) {
                return Text(
                  'No tienes clases asignadas para el día de hoy.',
                  style: textTheme.bodyMedium?.copyWith(color: AppTheme.slateGray),
                );
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: slots.map((slot) {
                  final classroomStr = (slot.classroomGrade != null && slot.classroomSection != null)
                      ? ' – ${slot.classroomGrade} "${slot.classroomSection}"'
                      : '';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${slot.startTime} – ${slot.subjectName}$classroomStr',
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