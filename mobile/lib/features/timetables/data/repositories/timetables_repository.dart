import 'package:dio/dio.dart';
import 'package:uecg_app/core/network/api_client.dart';
import 'package:uecg_app/features/dashboard/data/models/schedule_slot_model.dart';

class TimetablesRepository {
  final Dio _dio;

  TimetablesRepository({Dio? dio}) : _dio = dio ?? ApiClient.dio;

  /// Obtiene el horario semanal completo del usuario autenticado (Docente, Estudiante o Tutor)
  Future<List<ScheduleSlotModel>> getMySchedule() async {
    try {
      final response = await _dio.get('/timetables/my-schedule');
      final data = response.data;

      if (data is Map && data.containsKey('slots')) {
        final List<dynamic> rawSlots = data['slots'] as List<dynamic>? ?? [];
        return rawSlots
            .map((item) => ScheduleSlotModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }

      // Si es tutor y viene con 'children'
      if (data is Map && data.containsKey('children')) {
        final List<dynamic> children = data['children'] as List<dynamic>? ?? [];
        if (children.isNotEmpty) {
          final firstChild = children.first as Map<String, dynamic>;
          final List<dynamic> rawSlots = firstChild['slots'] as List<dynamic>? ?? [];
          return rawSlots
              .map((item) => ScheduleSlotModel.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }

      return [];
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['message'] ?? 'Error al obtener el horario';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Error inesperado al cargar el horario: $e');
    }
  }

  /// Obtiene únicamente las clases del día actual para el usuario autenticado
  Future<List<ScheduleSlotModel>> getTodaySchedule() async {
    try {
      final response = await _dio.get('/timetables/today');
      final data = response.data;

      if (data is Map && data.containsKey('slots')) {
        final List<dynamic> rawSlots = data['slots'] as List<dynamic>? ?? [];
        return rawSlots
            .map((item) => ScheduleSlotModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }

      if (data is Map && data.containsKey('children')) {
        final List<dynamic> children = data['children'] as List<dynamic>? ?? [];
        if (children.isNotEmpty) {
          final firstChild = children.first as Map<String, dynamic>;
          final List<dynamic> rawSlots = firstChild['slots'] as List<dynamic>? ?? [];
          return rawSlots
              .map((item) => ScheduleSlotModel.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }

      return [];
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['message'] ?? 'Error al obtener el horario de hoy';
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('Error inesperado al cargar el horario de hoy: $e');
    }
  }
}
