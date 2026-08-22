  import 'package:dio/dio.dart';
  import '../services/secure_storage_service.dart';

  class ApiClient {
    // 🔥 CAMBIO CRÍTICO: Apuntamos al servidor de producción en Render
    static const String baseUrl = 'https://ue-cheguevara-backend-1.onrender.com/api/v1';

    static Dio get dio {
      final Dio _dio = Dio(
        BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          responseType: ResponseType.json,
        ),
      );

      // ==========================================
      // INTERCEPTOR DE AUTENTICACIÓN
      // ==========================================
      _dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            // 1. Buscamos el JWT guardado en el dispositivo
            final token = await SecureStorageService.getToken();

            // 2. Lo inyectamos en las cabeceras (NestJS lo leerá gracias al Fallback que le pusimos)
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }

            return handler.next(options);
          },
          onError: (DioException e, handler) async {
            if (e.response?.statusCode == 401) {
              print('Token expirado o inválido. Cerrando sesión...');
              await SecureStorageService.deleteToken();
              // Redirigir al login (dependerá de tu manejador de estado: Riverpod, Bloc, Provider, etc.)
            }
            return handler.next(e);
          },
        ),
      );

      return _dio;
    }
  }