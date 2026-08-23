import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/teacher_course_model.dart';
import '../../data/repositories/teacher_dashboard_repository.dart';

final teacherDashboardRepositoryProvider = Provider<TeacherDashboardRepository>((ref) {
  return TeacherDashboardRepository();
});

class TeacherCoursesNotifier extends StateNotifier<AsyncValue<List<TeacherCourseModel>>> {
  final TeacherDashboardRepository _repository;

  TeacherCoursesNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadCourses();
  }

  Future<void> loadCourses() async {
    state = const AsyncValue.loading();
    try {
      final courses = await _repository.getAssignedCourses();
      state = AsyncValue.data(courses);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }

  Future<void> refresh() async {
    try {
      final courses = await _repository.getAssignedCourses();
      state = AsyncValue.data(courses);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}

final teacherCoursesProvider =
    StateNotifierProvider<TeacherCoursesNotifier, AsyncValue<List<TeacherCourseModel>>>((ref) {
  final repository = ref.watch(teacherDashboardRepositoryProvider);
  return TeacherCoursesNotifier(repository);
});
