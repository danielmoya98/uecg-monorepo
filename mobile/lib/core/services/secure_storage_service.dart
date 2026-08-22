import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'uecg_jwt_token';

  // Guardar el Token
  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  // Leer el Token
  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Borrar el Token (Cerrar Sesión)
  static Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }
}