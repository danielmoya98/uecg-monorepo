import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'uecg_jwt_token';
  static const _refreshTokenKey = 'uecg_refresh_token';
  static const _quickPinKey = 'uecg_quick_pin_hash';
  static const _cachedUserKey = 'uecg_cached_user_profile';

  // ==========================================
  // TOKENS
  // ==========================================

  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  static Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _refreshTokenKey, value: token);
  }

  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  // ==========================================
  // PIN RÁPIDO DE 4 DÍGITOS / OFFLINE
  // ==========================================

  static Future<void> saveQuickPin(String pin) async {
    await _storage.write(key: _quickPinKey, value: pin);
  }

  static Future<bool> verifyQuickPin(String pin) async {
    final storedPin = await _storage.read(key: _quickPinKey);
    return storedPin != null && storedPin == pin;
  }

  static Future<bool> hasQuickPin() async {
    final storedPin = await _storage.read(key: _quickPinKey);
    return storedPin != null && storedPin.isNotEmpty;
  }

  static Future<void> removeQuickPin() async {
    await _storage.delete(key: _quickPinKey);
  }

  // ==========================================
  // USER PROFILE CACHE (OFFLINE RESILIENCE)
  // ==========================================

  static Future<void> saveCachedUser(String userJson) async {
    await _storage.write(key: _cachedUserKey, value: userJson);
  }

  static Future<String?> getCachedUser() async {
    return await _storage.read(key: _cachedUserKey);
  }

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}