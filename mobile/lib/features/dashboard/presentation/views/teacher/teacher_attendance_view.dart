import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../providers/attendance_provider.dart';

class TeacherAttendanceView extends ConsumerWidget {
  const TeacherAttendanceView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textTheme = Theme.of(context).textTheme;
    final today = getTodayDateString();
    final scheduleAsync = ref.watch(teacherDailyScheduleProvider(today));
    final pendingOfflineCount = ref.watch(offlineSyncProvider);

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('CONTROL DE ASISTENCIA', style: textTheme.labelSmall),
                const SizedBox(height: 4),
                Text(
                  'HOY: $today',
                  style: textTheme.bodyMedium?.copyWith(
                    color: AppTheme.slateGray,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            if (pendingOfflineCount > 0)
              ActionChip(
                backgroundColor: const Color(0xFFF59E0B),
                avatar: const Icon(Icons.sync, size: 16, color: Colors.white),
                label: Text(
                  '$pendingOfflineCount PENDIENTES',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
                onPressed: () async {
                  final scaffoldMessenger = ScaffoldMessenger.of(context);
                  final synced =
                      await ref.read(offlineSyncProvider.notifier).syncAll();
                  scaffoldMessenger.showSnackBar(
                    SnackBar(
                      content: Text('Sincronizados $synced registros offline.'),
                      backgroundColor: AppTheme.swissBlue,
                    ),
                  );
                },
              ),
          ],
        ),
        const SizedBox(height: 24),
        scheduleAsync.when(
          loading: () => const Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: CircularProgressIndicator(color: AppTheme.swissBlue),
            ),
          ),
          error: (err, _) => Center(
            child: Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.lineGray),
                color: AppTheme.pureWhite,
              ),
              child: Column(
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      size: 36, color: Colors.red),
                  const SizedBox(height: 12),
                  Text(
                    'No se pudo cargar el horario del día.',
                    style: textTheme.labelSmall
                        ?.copyWith(color: AppTheme.inkBlack),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    err.toString().replaceAll('Exception: ', ''),
                    textAlign: TextAlign.center,
                    style:
                        textTheme.bodyMedium?.copyWith(color: AppTheme.slateGray),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.swissBlue,
                      foregroundColor: AppTheme.pureWhite,
                    ),
                    onPressed: () =>
                        ref.refresh(teacherDailyScheduleProvider(today)),
                    child: const Text('REINTENTAR'),
                  ),
                ],
              ),
            ),
          ),
          data: (blocks) {
            if (blocks.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(32.0),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.lineGray),
                  color: AppTheme.pureWhite,
                ),
                child: Column(
                  children: [
                    const Icon(Icons.event_busy,
                        size: 40, color: AppTheme.slateGray),
                    const SizedBox(height: 12),
                    Text(
                      'SIN CLASES PROGRAMADAS HOY',
                      style: textTheme.labelSmall
                          ?.copyWith(color: AppTheme.inkBlack),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'No tienes carga horaria asignada para el día de hoy.',
                      textAlign: TextAlign.center,
                      style: textTheme.bodyMedium
                          ?.copyWith(color: AppTheme.slateGray),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: blocks.map((block) {
                final title =
                    '${block.startTime} - ${block.subjectName.toUpperCase()} (${block.grade} ${block.section})';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: SwissCard(
                    label: title,
                    content: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Nivel: ${block.level} | Horario: ${block.timeRange}',
                          style: textTheme.bodySmall?.copyWith(
                            color: AppTheme.slateGray,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.qr_code_scanner),
                          label: const Text('ESCANEAR CARNETS (QR)'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.swissBlue,
                            foregroundColor: AppTheme.pureWhite,
                          ),
                          onPressed: () => context.push(
                            '/attendance/qr',
                            extra: {
                              'classPeriodId': block.firstClassPeriodId,
                              'classPeriodIds': block.classPeriodIds,
                              'courseTitle':
                                  '${block.subjectName} (${block.grade} ${block.section})',
                            },
                          ),
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          icon: const Icon(Icons.list_alt),
                          label: const Text('REGISTRO MANUAL'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.slateGray,
                            shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.zero,
                            ),
                            side: const BorderSide(color: AppTheme.lineGray),
                          ),
                          onPressed: () => context.push(
                            '/attendance/manual',
                            extra: {
                              'classroomId': block.classroomId,
                              'classPeriodId': block.firstClassPeriodId,
                              'classPeriodIds': block.classPeriodIds,
                              'courseTitle':
                                  '${block.subjectName} (${block.grade} ${block.section})',
                              'date': today,
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }
}