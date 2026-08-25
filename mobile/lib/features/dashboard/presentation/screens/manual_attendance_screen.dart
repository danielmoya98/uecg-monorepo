import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/models/attendance_block_model.dart';
import '../providers/attendance_provider.dart';

class ManualAttendanceScreen extends ConsumerStatefulWidget {
  final String? classroomId;
  final String? classPeriodId;
  final List<String>? classPeriodIds;
  final String? courseTitle;
  final String? date;

  const ManualAttendanceScreen({
    super.key,
    this.classroomId,
    this.classPeriodId,
    this.classPeriodIds,
    this.courseTitle,
    this.date,
  });

  @override
  ConsumerState<ManualAttendanceScreen> createState() =>
      _ManualAttendanceScreenState();
}

class _ManualAttendanceScreenState
    extends ConsumerState<ManualAttendanceScreen> {
  final Map<String, String> _studentStatuses = {}; // enrollmentId -> status
  bool _hasInitializedStatuses = false;
  bool _isSaving = false;

  void _initializeStatuses(List<ClassroomStudentAttendanceModel> students) {
    if (_hasInitializedStatuses) return;
    for (final student in students) {
      // Si el backend reporta PENDING o nulo, por defecto se inicializa en PRESENT
      _studentStatuses[student.enrollmentId] =
          student.currentStatus == 'PENDING'
              ? 'PRESENT'
              : student.currentStatus;
    }
    _hasInitializedStatuses = true;
  }

  void _markAllPresent(List<ClassroomStudentAttendanceModel> students) {
    setState(() {
      for (final s in students) {
        _studentStatuses[s.enrollmentId] = 'PRESENT';
      }
    });
  }

  Future<void> _handleSave(
      String classroomId, List<String> periodIds, String targetDate) async {
    if (_isSaving) return;

    setState(() => _isSaving = true);

    try {
      final records = _studentStatuses.entries
          .map((e) => {
                'enrollmentId': e.key,
                'status': e.value,
              })
          .toList();

      final payload = BulkAttendancePayload(
        classroomId: classroomId,
        classPeriodIds: periodIds,
        date: targetDate,
        records: records,
      );

      final repo = ref.read(attendanceRepositoryProvider);
      await repo.saveBulkAttendance(payload);

      // Refrescar contador offline por si se guardó sin conexión
      ref.read(offlineSyncProvider.notifier).refreshCount();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Asistencia guardada exitosamente.',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final targetDate = widget.date ?? getTodayDateString();
    final classroomId = widget.classroomId ?? '';
    final classPeriodId = widget.classPeriodId ?? '';
    final classPeriodIds = widget.classPeriodIds ??
        (classPeriodId.isNotEmpty ? [classPeriodId] : []);

    if (classroomId.isEmpty || classPeriodId.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: Text('REGISTRO MANUAL', style: textTheme.labelSmall),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Text(
              'No se especificó el aula o periodo de clases.\nSeleccione un bloque desde el horario del docente.',
              textAlign: TextAlign.center,
              style: textTheme.bodyLarge,
            ),
          ),
        ),
      );
    }

    final query = ClassroomAttendanceQuery(
      classroomId: classroomId,
      classPeriodId: classPeriodId,
      date: targetDate,
    );

    final studentsAsync = ref.watch(classroomAttendanceProvider(query));

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.inkBlack),
        title: Text(
          widget.courseTitle != null
              ? 'MANUAL: ${widget.courseTitle!.toUpperCase()}'
              : 'REGISTRO MANUAL',
          style: textTheme.labelSmall,
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1),
        ),
      ),
      body: studentsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.swissBlue),
        ),
        error: (err, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'No se pudo cargar la lista de estudiantes.',
                  style: textTheme.labelSmall?.copyWith(color: AppTheme.inkBlack),
                ),
                const SizedBox(height: 8),
                Text(
                  err.toString().replaceAll('Exception: ', ''),
                  textAlign: TextAlign.center,
                  style: textTheme.bodyMedium?.copyWith(color: AppTheme.slateGray),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.swissBlue,
                    foregroundColor: AppTheme.pureWhite,
                  ),
                  onPressed: () => ref.refresh(classroomAttendanceProvider(query)),
                  child: const Text('REINTENTAR'),
                ),
              ],
            ),
          ),
        ),
        data: (students) {
          if (students.isEmpty) {
            return Center(
              child: Text(
                'No hay estudiantes inscritos en este curso.',
                style: textTheme.bodyLarge?.copyWith(color: AppTheme.slateGray),
              ),
            );
          }

          _initializeStatuses(students);

          // Contadores
          int presentCount = 0;
          int lateCount = 0;
          int absentCount = 0;
          int excusedCount = 0;

          for (final s in students) {
            final st = _studentStatuses[s.enrollmentId] ?? 'PRESENT';
            if (st == 'PRESENT') presentCount++;
            if (st == 'LATE') lateCount++;
            if (st == 'ABSENT') absentCount++;
            if (st == 'EXCUSED') excusedCount++;
          }

          return Column(
            children: [
              // Barra de acciones y resumen
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
                decoration: const BoxDecoration(
                  color: AppTheme.pureWhite,
                  border: Border(
                    bottom: BorderSide(color: AppTheme.lineGray, width: 1),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        _buildSummaryBadge('P: $presentCount', const Color(0xFF10B981)),
                        const SizedBox(width: 6),
                        _buildSummaryBadge('A: $lateCount', const Color(0xFFF59E0B)),
                        const SizedBox(width: 6),
                        _buildSummaryBadge('F: $absentCount', const Color(0xFFEF4444)),
                        const SizedBox(width: 6),
                        _buildSummaryBadge('L: $excusedCount', const Color(0xFF3B82F6)),
                      ],
                    ),
                    TextButton.icon(
                      icon: const Icon(Icons.done_all, size: 16),
                      label: const Text(
                        'TODOS P',
                        style: TextStyle(
                            fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      style: TextButton.styleFrom(
                        foregroundColor: AppTheme.swissBlue,
                      ),
                      onPressed: () => _markAllPresent(students),
                    ),
                  ],
                ),
              ),

              // Lista de estudiantes
              Expanded(
                child: ListView.separated(
                  itemCount: students.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final student = students[index];
                    final currentStatus =
                        _studentStatuses[student.enrollmentId] ?? 'PRESENT';

                    return Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24.0, vertical: 12.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  student.fullName,
                                  style: textTheme.bodyMedium?.copyWith(
                                    color: AppTheme.inkBlack,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (student.rude != null &&
                                    student.rude!.isNotEmpty)
                                  Text(
                                    'RUDE: ${student.rude}',
                                    style: textTheme.bodySmall?.copyWith(
                                      color: AppTheme.slateGray,
                                      fontSize: 10,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          // Bloques de estado suizo: P (Presente), A (Atraso), F (Falta), L (Licencia)
                          Row(
                            children: [
                              _buildStatusBlock(
                                'P',
                                currentStatus == 'PRESENT',
                                const Color(0xFF10B981),
                                () => setState(() => _studentStatuses[
                                    student.enrollmentId] = 'PRESENT'),
                              ),
                              const SizedBox(width: 6),
                              _buildStatusBlock(
                                'A',
                                currentStatus == 'LATE',
                                const Color(0xFFF59E0B),
                                () => setState(() => _studentStatuses[
                                    student.enrollmentId] = 'LATE'),
                              ),
                              const SizedBox(width: 6),
                              _buildStatusBlock(
                                'F',
                                currentStatus == 'ABSENT',
                                const Color(0xFFEF4444),
                                () => setState(() => _studentStatuses[
                                    student.enrollmentId] = 'ABSENT'),
                              ),
                              const SizedBox(width: 6),
                              _buildStatusBlock(
                                'L',
                                currentStatus == 'EXCUSED',
                                const Color(0xFF3B82F6),
                                () => setState(() => _studentStatuses[
                                    student.enrollmentId] = 'EXCUSED'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(24.0),
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppTheme.lineGray, width: 1)),
          color: AppTheme.pureWhite,
        ),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.swissBlue,
            foregroundColor: AppTheme.pureWhite,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          onPressed: _isSaving
              ? null
              : () => _handleSave(classroomId, classPeriodIds, targetDate),
          child: _isSaving
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text(
                  'GUARDAR ASISTENCIA DEL BLOQUE',
                  style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
        ),
      ),
    );
  }

  Widget _buildSummaryBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildStatusBlock(
      String label, bool isActive, Color activeColor, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isActive ? activeColor : AppTheme.pureWhite,
          border: Border.all(
            color: isActive ? activeColor : AppTheme.lineGray,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: isActive ? AppTheme.pureWhite : AppTheme.slateGray,
                fontWeight: FontWeight.bold,
              ),
        ),
      ),
    );
  }
}