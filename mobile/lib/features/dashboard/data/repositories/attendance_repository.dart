import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/network/api_client.dart';
import '../models/attendance_block_model.dart';
import '../models/institution_model.dart';

class AttendanceRepository {
  final Dio _dio;
  static const String _offlineQueueKey = 'uecg_offline_attendance_queue';

  AttendanceRepository({Dio? dio}) : _dio = dio ?? ApiClient.dio;

  /// Obtiene los bloques de horario del día para el docente
  Future<List<AttendanceDailyBlockModel>> getDailySchedule(String date) async {
    try {
      final response = await _dio.get('/attendance/schedule', queryParameters: {
        'date': date,
      });

      final data = response.data;
      final list = data is List
          ? data
          : (data is Map && data.containsKey('data') ? data['data'] as List : []);

      return list
          .map((item) =>
              AttendanceDailyBlockModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final message =
          e.response?.data?['message'] ?? 'Error al obtener horario del día';
      throw Exception(message);
    } catch (e) {
      throw Exception('Error al cargar horario: $e');
    }
  }

  /// Obtiene los alumnos y el estado de asistencia de un curso/periodo
  Future<List<ClassroomStudentAttendanceModel>> getClassroomAttendance({
    required String classroomId,
    required String classPeriodId,
    required String date,
  }) async {
    try {
      final response =
          await _dio.get('/attendance/classroom', queryParameters: {
        'classroomId': classroomId,
        'classPeriodId': classPeriodId,
        'date': date,
      });

      final data = response.data;
      final list = data is List
          ? data
          : (data is Map && data.containsKey('data') ? data['data'] as List : []);

      return list
          .map((item) => ClassroomStudentAttendanceModel.fromJson(
              item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ??
          'Error al obtener lista de estudiantes del aula';
      throw Exception(message);
    } catch (e) {
      throw Exception('Error al cargar lista: $e');
    }
  }

  /// Guarda la lista masiva de asistencia en el backend
  Future<void> saveBulkAttendance(BulkAttendancePayload payload) async {
    try {
      await _dio.post('/attendance/bulk', data: payload.toJson());
    } on DioException catch (e) {
      // Si hay error de red/conexión, guardamos en la cola local
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        await enqueueOfflineBulk(payload);
        return;
      }
      final message =
          e.response?.data?['message'] ?? 'Error al guardar asistencia masiva';
      throw Exception(message);
    } catch (e) {
      await enqueueOfflineBulk(payload);
    }
  }

  /// Envía escaneo QR
  Future<QRAttendanceResultModel> scanQR({
    required String qrToken,
    required List<String> classPeriodIds,
  }) async {
    try {
      final payload = {
        'qrToken': qrToken,
        'method': 'QR',
        'classPeriodIds': classPeriodIds,
        if (classPeriodIds.isNotEmpty) 'classPeriodId': classPeriodIds.first,
      };

      final response = await _dio.post('/attendance/scan', data: payload);
      final data = response.data;
      final map = data is Map<String, dynamic> && data.containsKey('data')
          ? data['data'] as Map<String, dynamic>
          : data as Map<String, dynamic>;
      return QRAttendanceResultModel.fromJson(map);
    } on DioException catch (e) {
      final message =
          e.response?.data?['message'] ?? 'Error al validar carnet QR';
      throw Exception(message);
    }
  }

  // ==========================================
  // 🛡️ COLA DE CONTINGENCIA OFFLINE
  // ==========================================

  /// Encola un guardado masivo para sincronización posterior
  Future<void> enqueueOfflineBulk(BulkAttendancePayload payload) async {
    final prefs = await SharedPreferences.getInstance();
    final currentQueue = prefs.getStringList(_offlineQueueKey) ?? [];
    currentQueue.add(jsonEncode(payload.toJson()));
    await prefs.setStringList(_offlineQueueKey, currentQueue);
  }

  /// Retorna la cantidad de elementos pendientes de sincronizar
  Future<int> getPendingOfflineCount() async {
    final prefs = await SharedPreferences.getInstance();
    final currentQueue = prefs.getStringList(_offlineQueueKey) ?? [];
    return currentQueue.length;
  }

  /// Sincroniza todos los registros pendientes con el backend
  Future<int> syncOfflineQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final queue = prefs.getStringList(_offlineQueueKey) ?? [];
    if (queue.isEmpty) return 0;

    int syncedCount = 0;
    final remainingQueue = <String>[];

    for (final rawJson in queue) {
      try {
        final map = jsonDecode(rawJson) as Map<String, dynamic>;
        final payload = BulkAttendancePayload.fromJson(map);
        await _dio.post('/attendance/bulk', data: payload.toJson());
        syncedCount++;
      } catch (e) {
        remainingQueue.add(rawJson);
      }
    }

    await prefs.setStringList(_offlineQueueKey, remainingQueue);
    return syncedCount;
  }
}
