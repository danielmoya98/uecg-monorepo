import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/secure_storage_service.dart';

class AuthRepository {
  final Dio _dio = ApiClient.dio;

  // Enviar el FCM Token al Backend
  Future<void> syncFcmToken(String fcmToken) async {
    try {
      await _dio.post('/auth/fcm-token', data: {'fcmToken': fcmToken});
    } catch (_) {
      // Manejo silencioso de error de sync push
    }
  }

  // 1. INICIAR SESIÓN
  Future<Map<String, dynamic>> login(String identifier, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'email': identifier, 'password': password},
      );
      final data = response.data['data'] ?? response.data;

      // Guardamos el JWT
      final token = data['accessToken'] ?? data['access_token'];
      if (token != null) {
        await SecureStorageService.saveToken(token);
      }
      final refreshToken = data['refreshToken'];
      if (refreshToken != null) {
        await SecureStorageService.saveRefreshToken(refreshToken);
      }

      final user = data['user'] as Map<String, dynamic>;
      await SecureStorageService.saveCachedUser(jsonEncode(user));

      // Sincronizar Token FCM
      try {
        String? fcmToken = await FirebaseMessaging.instance.getToken();
        if (fcmToken != null) {
          await syncFcmToken(fcmToken);
        }
      } catch (_) {}

      return user;
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
      final data = response.data['data'] ?? response.data;

      final token = data['accessToken'] ?? data['access_token'];
      if (token != null) {
        await SecureStorageService.saveToken(token);
      }
      final refreshToken = data['refreshToken'];
      if (refreshToken != null) {
        await SecureStorageService.saveRefreshToken(refreshToken);
      }

      final user = data['user'] as Map<String, dynamic>;
      await SecureStorageService.saveCachedUser(jsonEncode(user));

      try {
        String? fcmToken = await FirebaseMessaging.instance.getToken();
        if (fcmToken != null) {
          await syncFcmToken(fcmToken);
        }
      } catch (_) {}

      return user;
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
      final data = response.data['data'] ?? response.data;

      final token = data['accessToken'] ?? data['access_token'];
      if (token != null) {
        await SecureStorageService.saveToken(token);
      }
      final refreshToken = data['refreshToken'];
      if (refreshToken != null) {
        await SecureStorageService.saveRefreshToken(refreshToken);
      }

      final user = data['user'] as Map<String, dynamic>;
      await SecureStorageService.saveCachedUser(jsonEncode(user));

      try {
        String? fcmToken = await FirebaseMessaging.instance.getToken();
        if (fcmToken != null) {
          await syncFcmToken(fcmToken);
        }
      } catch (_) {}

      return user;
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

  // 6. AUTORIZAR QR WEB LOGIN (Estilo WhatsApp Web)
  Future<bool> authorizeWebQr(String challengeId) async {
    try {
      final response = await _dio.post(
        '/auth/qr-challenge/authorize',
        data: {'challengeId': challengeId},
      );
      return response.data['status'] == 'SUCCESS';
    } catch (e) {
      throw Exception('El código QR ha expirado o no es válido');
    }
  }

  // 7. OBTENER SESIONES ACTIVAS
  Future<List<Map<String, dynamic>>> getUserSessions() async {
    try {
      final response = await _dio.get('/auth/sessions');
      final list = response.data['sessions'] as List<dynamic>? ?? [];
      return list.map((item) => item as Map<String, dynamic>).toList();
    } catch (e) {
      return [];
    }
  }

  // 8. REVOCAR SESIÓN
  Future<bool> revokeSession(String sessionId) async {
    try {
      final response = await _dio.delete('/auth/sessions/$sessionId');
      return response.data['status'] == 'SUCCESS';
    } catch (e) {
      return false;
    }
  }

  // 9. REVOCAR TODAS LAS DEMÁS SESIONES
  Future<bool> revokeOtherSessions() async {
    try {
      final response = await _dio.delete('/auth/sessions/other');
      return response.data['status'] == 'SUCCESS';
    } catch (e) {
      return false;
    }
  }

  // 10. OBTENER PERFIL ACTUAL (Universal para DOCENTE, PADRE, ESTUDIANTE)
  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final response = await _dio.get('/users/profile');
      final data = response.data['data'] ?? response.data;
      return data as Map<String, dynamic>;
    } catch (_) {
      try {
        final response = await _dio.get('/auth/me');
        final data = response.data['user'] ?? response.data['data'] ?? response.data;
        return data as Map<String, dynamic>;
      } catch (e) {
        throw Exception('Error al obtener perfil de usuario');
      }
    }
  }

  // Compatibilidad con perfiles de tutor
  Future<Map<String, dynamic>> getGuardianProfile() async {
    try {
      final response = await _dio.get('/guardians/me');
      return response.data['data'] ?? response.data;
    } catch (_) {
      return await getUserProfile();
    }
  }
}