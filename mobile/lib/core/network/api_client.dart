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
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        responseType: ResponseType.json,
      ),
    );

    dio.interceptors.add(
      QueuedInterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorageService.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          final refreshToken = await SecureStorageService.getRefreshToken();
          if (refreshToken != null && refreshToken.isNotEmpty) {
            options.headers['x-refresh-token'] = refreshToken;
          }

          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          final isAuthError = error.response?.statusCode == 401;
          final isRefreshRequest = error.requestOptions.path.contains('/auth/refresh');
          final isLoginRequest = error.requestOptions.path.contains('/auth/login');

          if (isAuthError && !isRefreshRequest && !isLoginRequest) {
            final refreshToken = await SecureStorageService.getRefreshToken();

            if (refreshToken != null && refreshToken.isNotEmpty) {
              try {
                // Instancia aislada para no ciclar el interceptor
                final refreshDio = Dio(BaseOptions(baseUrl: baseUrl));
                final response = await refreshDio.post(
                  '/auth/refresh',
                  data: {'refreshToken': refreshToken},
                  options: Options(headers: {'x-refresh-token': refreshToken}),
                );

                final data = response.data['data'] ?? response.data;
                final newAccessToken = data['accessToken'] ?? data['access_token'];
                final newRefreshToken = data['refreshToken'];

                if (newAccessToken != null) {
                  await SecureStorageService.saveToken(newAccessToken);
                }
                if (newRefreshToken != null) {
                  await SecureStorageService.saveRefreshToken(newRefreshToken);
                }

                // Reintentar la petición original con el nuevo token
                final options = error.requestOptions;
                options.headers['Authorization'] = 'Bearer $newAccessToken';
                if (newRefreshToken != null) {
                  options.headers['x-refresh-token'] = newRefreshToken;
                }

                final retryResponse = await dio.fetch(options);
                return handler.resolve(retryResponse);
              } catch (_) {
                // Si el refresh token también expiró en el servidor
                await SecureStorageService.deleteToken();
              }
            }
          }

          return handler.next(error);
        },
      ),
    );

    return dio;
  }
}