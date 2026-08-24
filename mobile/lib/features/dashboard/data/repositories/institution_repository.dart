import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/institution_model.dart';

class InstitutionRepository {
  final Dio _dio;

  // 🛡️ BLINDAJE OFFLINE: Caché en memoria para contingencia escolar
  static AttendanceSettingsModel _cachedAttendanceSettings =
      const AttendanceSettingsModel(
    enableQrAttendance: true,
    enableBiometricAttendance: false,
    lateToleranceMinutes: 5,
    absentToleranceMinutes: 15,
    notificationFrequency: 'ALERTS_ONLY',
  );

  static CampaignSettingsModel _cachedCampaignSettings =
      const CampaignSettingsModel(
    enableDigitalRudeUpdates: false,
    maxRudeUpdatesPerYear: 2,
    activeNotificationChannels: ['PUSH_APP'],
  );

  InstitutionRepository({Dio? dio}) : _dio = dio ?? ApiClient.dio;

  /// Obtiene los parámetros de control de asistencia de la institución
  Future<AttendanceSettingsModel> getAttendanceSettings() async {
    try {
      final response = await _dio.get('/institutions/attendance-settings');
      final data = response.data;
      final map = data is Map<String, dynamic> && data.containsKey('data')
          ? data['data'] as Map<String, dynamic>
          : data as Map<String, dynamic>;
      final model = AttendanceSettingsModel.fromJson(map);
      _cachedAttendanceSettings = model;
      return model;
    } on DioException catch (e) {
      // Si la red falla o hay timeout, usamos la última configuración válida guardada
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        return _cachedAttendanceSettings;
      }
      final message = e.response?.data?['message'] ??
          'Error al obtener configuración de asistencia';
      throw Exception(message);
    } catch (e) {
      return _cachedAttendanceSettings;
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
      final model = CampaignSettingsModel.fromJson(map);
      _cachedCampaignSettings = model;
      return model;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        return _cachedCampaignSettings;
      }
      final message = e.response?.data?['message'] ??
          'Error al obtener configuración de campaña';
      throw Exception(message);
    } catch (e) {
      return _cachedCampaignSettings;
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
