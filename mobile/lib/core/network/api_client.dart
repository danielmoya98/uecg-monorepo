import 'package:dio/dio.dart';
import '../services/secure_storage_service.dart';

class ApiClient {
  static const String baseUrl = 'https://ue-cheguevara-backend-1.onrender.com/api/v1';

  static final Dio _instance = _createDio();

  static Dio get dio => _instance;

  static Dio _createDio() {
    final Dio dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        responseType: ResponseType.json,
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorageService.getToken();
          if (token != null && !options.headers.containsKey('Authorization')) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          // Solo borramos el token si falla la ruta de verificación de perfil o refresh token
          // NUNCA en rutas de login, QR o endpoints de validación
          final path = e.requestOptions.path;
          final isProfileOrRefresh = path.contains('/me') || path.contains('/refresh-token');
          if (e.response?.statusCode == 401 && isProfileOrRefresh) {
            await SecureStorageService.deleteToken();
          }
          return handler.next(e);
        },
      ),
    );

    return dio;
  }
}