import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/attendance_block_model.dart';
import '../../data/repositories/attendance_repository.dart';

final attendanceRepositoryProvider = Provider<AttendanceRepository>((ref) {
  return AttendanceRepository();
});

/// Obtiene la fecha local en formato YYYY-MM-DD
String getTodayDateString() {
  final now = DateTime.now();
  final year = now.year.toString().padLeft(4, '0');
  final month = now.month.toString().padLeft(2, '0');
  final day = now.day.toString().padLeft(2, '0');
  return '$year-$month-$day';
}

/// Provider para el horario diario de bloques del docente
final teacherDailyScheduleProvider =
    FutureProvider.family<List<AttendanceDailyBlockModel>, String>(
        (ref, date) async {
  final repository = ref.watch(attendanceRepositoryProvider);
  return repository.getDailySchedule(date);
});

/// Argumentos para consultar asistencia de aula
class ClassroomAttendanceQuery {
  final String classroomId;
  final String classPeriodId;
  final String date;

  const ClassroomAttendanceQuery({
    required this.classroomId,
    required this.classPeriodId,
    required this.date,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ClassroomAttendanceQuery &&
          runtimeType == other.runtimeType &&
          classroomId == other.classroomId &&
          classPeriodId == other.classPeriodId &&
          date == other.date;

  @override
  int get hashCode =>
      classroomId.hashCode ^ classPeriodId.hashCode ^ date.hashCode;
}

/// Provider para la lista de estudiantes de un aula/periodo
final classroomAttendanceProvider = FutureProvider.family<
    List<ClassroomStudentAttendanceModel>, ClassroomAttendanceQuery>(
        (ref, query) async {
  final repository = ref.watch(attendanceRepositoryProvider);
  return repository.getClassroomAttendance(
    classroomId: query.classroomId,
    classPeriodId: query.classPeriodId,
    date: query.date,
  );
});

/// Notifier para monitorear y sincronizar elementos offline pendientes
class OfflineSyncNotifier extends StateNotifier<int> {
  final AttendanceRepository _repository;

  OfflineSyncNotifier(this._repository) : super(0) {
    refreshCount();
  }

  Future<void> refreshCount() async {
    state = await _repository.getPendingOfflineCount();
  }

  Future<int> syncAll() async {
    final synced = await _repository.syncOfflineQueue();
    await refreshCount();
    return synced;
  }
}

final offlineSyncProvider =
    StateNotifierProvider<OfflineSyncNotifier, int>((ref) {
  final repo = ref.watch(attendanceRepositoryProvider);
  return OfflineSyncNotifier(repo);
});
