import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/grade_model.dart';
import '../../data/repositories/grades_repository.dart';

final gradesRepositoryProvider = Provider<GradesRepository>((ref) {
  return GradesRepository();
});

/// Notifier para las notas del estudiante autenticado
class StudentGradesNotifier extends StateNotifier<AsyncValue<GradesReportModel>> {
  final GradesRepository _repository;

  StudentGradesNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadGrades();
  }

  Future<void> loadGrades() async {
    state = const AsyncValue.loading();
    try {
      final report = await _repository.getMyGrades();
      state = AsyncValue.data(report);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> refresh() async {
    try {
      final report = await _repository.getMyGrades();
      state = AsyncValue.data(report);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

final studentGradesProvider =
    StateNotifierProvider<StudentGradesNotifier, AsyncValue<GradesReportModel>>((ref) {
  final repo = ref.watch(gradesRepositoryProvider);
  return StudentGradesNotifier(repo);
});

/// Notifier para las notas de un hijo consultado por el padre/tutor
class ParentGradesNotifier extends StateNotifier<AsyncValue<GradesReportModel>> {
  final GradesRepository _repository;
  final String studentId;

  ParentGradesNotifier(this._repository, this.studentId) : super(const AsyncValue.loading()) {
    if (studentId.isNotEmpty) {
      loadGrades();
    }
  }

  Future<void> loadGrades() async {
    state = const AsyncValue.loading();
    try {
      final report = await _repository.getStudentGradesForGuardian(studentId);
      state = AsyncValue.data(report);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> refresh() async {
    try {
      final report = await _repository.getStudentGradesForGuardian(studentId);
      state = AsyncValue.data(report);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

final parentGradesProvider = StateNotifierProvider.family<ParentGradesNotifier,
    AsyncValue<GradesReportModel>, String>((ref, studentId) {
  final repo = ref.watch(gradesRepositoryProvider);
  return ParentGradesNotifier(repo, studentId);
});
