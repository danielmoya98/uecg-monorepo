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
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorageService.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          // No borramos tokens automáticamente en onError para evitar deslogueos accidentales
          return handler.next(e);
        },
      ),
    );

    return dio;
  }
}