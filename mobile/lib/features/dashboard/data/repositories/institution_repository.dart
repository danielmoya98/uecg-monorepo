import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/institution_model.dart';

class InstitutionRepository {
  final Dio _dio;

  InstitutionRepository({Dio? dio}) : _dio = dio ?? ApiClient.dio;

  /// Obtiene los parámetros de control de asistencia de la institución
  Future<AttendanceSettingsModel> getAttendanceSettings() async {
    try {
      final response = await _dio.get('/institutions/attendance-settings');
      final data = response.data;
      final map = data is Map<String, dynamic> && data.containsKey('data')
          ? data['data'] as Map<String, dynamic>
          : data as Map<String, dynamic>;
      return AttendanceSettingsModel.fromJson(map);
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Error al obtener configuración de asistencia';
      throw Exception(message);
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }

  /// Obtiene los parámetros de la campaña RUDE
  Future<CampaignSettingsModel> getCampaignSettings() async {
    try {
      final response = await _dio.get('/institutions/campaign-settings');
      final data = response.data;
      final map = data is Map<String, dynamic> && data.containsKey('data')
          ? data['data'] as Map<String, dynamic>
          : data as Map<String, dynamic>;
      return CampaignSettingsModel.fromJson(map);
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Error al obtener configuración de campaña';
      throw Exception(message);
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }

  /// Envía un token QR escaneado al backend para registrar la asistencia del bloque
  Future<QRAttendanceResultModel> scanQRAttendance({
    required String qrToken,
    String? classPeriodId,
    List<String>? classPeriodIds,
  }) async {
    try {
      final payload = {
        'qrToken': qrToken,
        'method': 'QR',
        if (classPeriodId != null) 'classPeriodId': classPeriodId,
        if (classPeriodIds != null && classPeriodIds.isNotEmpty)
          'classPeriodIds': classPeriodIds,
      };

      final response = await _dio.post('/attendance/scan', data: payload);
      final data = response.data;
      final map = data is Map<String, dynamic> && data.containsKey('data')
          ? data['data'] as Map<String, dynamic>
          : data as Map<String, dynamic>;
      return QRAttendanceResultModel.fromJson(map);
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Error al validar código QR';
      throw Exception(message);
    } catch (e) {
      throw Exception('Error de escaneo: $e');
    }
  }
}
