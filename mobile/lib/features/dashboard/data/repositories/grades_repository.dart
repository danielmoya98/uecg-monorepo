import 'package:dio/dio.dart';
import 'package:uecg_app/core/network/api_client.dart';
import '../models/grade_model.dart';

class GradesRepository {
  final Dio _dio;

  GradesRepository({Dio? dio}) : _dio = dio ?? ApiClient.dio;

  /// Obtiene el boletín de calificaciones para el estudiante autenticado
  Future<GradesReportModel> getMyGrades() async {
    try {
      final response = await _dio.get('/grades/my-grades');
      final data = response.data['data'] ?? response.data;
      return GradesReportModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['message'] ?? 'Error al obtener calificaciones';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Error inesperado al cargar calificaciones: $e');
    }
  }

  /// Obtiene el boletín de calificaciones de un estudiante para el padre/tutor
  Future<GradesReportModel> getStudentGradesForGuardian(String studentId) async {
    try {
      final response = await _dio.get('/grades/student/$studentId');
      final data = response.data['data'] ?? response.data;
      return GradesReportModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['message'] ?? 'Error al obtener calificaciones del alumno';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Error inesperado al cargar calificaciones del alumno: $e');
    }
  }
}
