import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/teacher_course_model.dart';

class TeacherDashboardRepository {
  final Dio _dio;

  TeacherDashboardRepository({Dio? dio}) : _dio = dio ?? ApiClient.dio;

  /// Obtiene los cursos asignados al docente autenticado
  Future<List<TeacherCourseModel>> getAssignedCourses() async {
    try {
      // Intentamos primero consultar por asignaciones docentes (/teacher-assignments)
      final response = await _dio.get('/teacher-assignments');
      final data = response.data;

      final List<dynamic> items = data is Map && data.containsKey('data')
          ? data['data'] as List<dynamic>
          : (data is List ? data : []);

      if (items.isNotEmpty) {
        return items
            .map((item) => TeacherCourseModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }

      // Fallback a /classrooms filtrado por el JWT del usuario
      final classroomsResponse = await _dio.get('/classrooms');
      final classroomsData = classroomsResponse.data;
      final List<dynamic> classroomItems = classroomsData is Map && classroomsData.containsKey('data')
          ? classroomsData['data'] as List<dynamic>
          : (classroomsData is List ? classroomsData : []);

      return classroomItems
          .map((item) => TeacherCourseModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['message'] ?? 'Error al cargar los cursos asignados';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Error inesperado al obtener los cursos: $e');
    }
  }
}
