import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/secure_storage_service.dart';

class AuthRepository {
  final Dio _dio = ApiClient.dio;

  // 🔥 NUEVO: Enviar el FCM Token al Backend
  Future<void> syncFcmToken(String fcmToken) async {
    try {
      // Dio inyectará el JWT gracias a tu interceptor
      await _dio.patch('/auth/fcm-token', data: {'fcmToken': fcmToken});
      print('✅ FCM Token sincronizado con NestJS');
    } catch (e) {
      print('⚠️ Error al sincronizar FCM Token: $e');
    }
  }

  // 1. INICIAR SESIÓN
  Future<Map<String, dynamic>> login(String identifier, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'email': identifier, 'password': password},
      );
      final data = response.data['data'];

      // Guardamos el JWT
      await SecureStorageService.saveToken(data['access_token']);

      // 🔥 LA MAGIA: Sincronizar Token FCM
      String? fcmToken = await FirebaseMessaging.instance.getToken();
      if (fcmToken != null) {
        await syncFcmToken(fcmToken);
      }

      return data['user'];
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) throw Exception('Credenciales incorrectas');
      throw Exception('Error al conectar con el servidor');
    }
  }

  // 2. REGISTRO PADRE / TUTOR
  Future<Map<String, dynamic>> registerGuardian(String ci, String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/register-guardian',
        data: {'ci': ci, 'recoveryEmail': email, 'password': password},
      );
      final data = response.data['data'];

      // Guardamos el JWT
      await SecureStorageService.saveToken(data['access_token']);

      // 🔥 Sincronizar Token FCM
      String? fcmToken = await FirebaseMessaging.instance.getToken();
      if (fcmToken != null) {
        await syncFcmToken(fcmToken);
      }

      return data['user'];
    } catch (e) {
      throw Exception('Error al registrar el tutor. Verifique su CI.');
    }
  }

  // 3. REGISTRO ESTUDIANTE
  Future<Map<String, dynamic>> registerStudent(String ci, String birthDate, String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/register-student',
        data: {'ci': ci, 'birthDate': birthDate, 'recoveryEmail': email, 'password': password},
      );
      final data = response.data['data'];

      // Guardamos el JWT
      await SecureStorageService.saveToken(data['access_token']);

      // 🔥 Sincronizar Token FCM
      String? fcmToken = await FirebaseMessaging.instance.getToken();
      if (fcmToken != null) {
        await syncFcmToken(fcmToken);
      }

      return data['user'];
    } catch (e) {
      throw Exception('Error al registrar el estudiante. Verifique sus datos.');
    }
  }

  // 4. RECUPERAR CONTRASEÑA (Paso 1)
  Future<void> forgotPassword(String identifier) async {
    await _dio.post('/auth/forgot-password', data: {'identifier': identifier});
  }

  // 5. CAMBIAR CONTRASEÑA (Paso 2)
  Future<void> resetPassword(String identifier, String code, String newPassword) async {
    await _dio.post(
      '/auth/reset-password',
      data: {'identifier': identifier, 'code': code, 'newPassword': newPassword},
    );
  }

  // 6. OBTENER PERFIL ACTUAL (El Latido Principal)
  Future<Map<String, dynamic>> getGuardianProfile() async {
    try {
      final response = await _dio.get('/guardians/me');
      return response.data['data'];
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception('No pudimos cargar tus datos familiares. Acércate a secretaría.');
      }
      throw Exception('Error al conectar con el servidor.');
    }
  }
}