import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
      resetOnError: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  static final Map<String, String> _memCache = {};

  static const _tokenKey = 'uecg_jwt_token';
  static const _refreshTokenKey = 'uecg_refresh_token';
  static const _quickPinKey = 'uecg_quick_pin_hash';
  static const _cachedUserKey = 'uecg_cached_user_profile';
  static const _onboardingSeenKey = 'uecg_onboarding_seen';

  // ==========================================
  // TOKENS
  // ==========================================

  static Future<void> saveToken(String token) async {
    _memCache[_tokenKey] = token;
    try {
      await _storage.write(key: _tokenKey, value: token);
    } catch (_) {}
  }

  static Future<String?> getToken() async {
    if (_memCache.containsKey(_tokenKey) && _memCache[_tokenKey] != null && _memCache[_tokenKey]!.isNotEmpty) {
      return _memCache[_tokenKey];
    }
    try {
      final val = await _storage.read(key: _tokenKey);
      if (val != null && val.isNotEmpty) {
        _memCache[_tokenKey] = val;
        return val;
      }
    } catch (_) {}
    return _memCache[_tokenKey];
  }

  static Future<void> saveRefreshToken(String token) async {
    _memCache[_refreshTokenKey] = token;
    try {
      await _storage.write(key: _refreshTokenKey, value: token);
    } catch (_) {}
  }

  static Future<String?> getRefreshToken() async {
    if (_memCache.containsKey(_refreshTokenKey)) {
      return _memCache[_refreshTokenKey];
    }
    try {
      final val = await _storage.read(key: _refreshTokenKey);
      if (val != null) {
        _memCache[_refreshTokenKey] = val;
        return val;
      }
    } catch (_) {}
    return _memCache[_refreshTokenKey];
  }

  static Future<void> deleteToken() async {
    _memCache.remove(_tokenKey);
    _memCache.remove(_refreshTokenKey);
    try {
      await _storage.delete(key: _tokenKey);
      await _storage.delete(key: _refreshTokenKey);
    } catch (_) {}
  }

  // ==========================================
  // ONBOARDING FIRST-TIME TRACKER
  // ==========================================

  static Future<void> setOnboardingSeen(bool seen) async {
    _memCache[_onboardingSeenKey] = seen ? 'true' : 'false';
    try {
      await _storage.write(key: _onboardingSeenKey, value: seen ? 'true' : 'false');
    } catch (_) {}
  }

  static Future<bool> hasSeenOnboarding() async {
    if (_memCache.containsKey(_onboardingSeenKey)) {
      return _memCache[_onboardingSeenKey] == 'true';
    }
    try {
      final val = await _storage.read(key: _onboardingSeenKey);
      if (val != null) {
        _memCache[_onboardingSeenKey] = val;
        return val == 'true';
      }
    } catch (_) {}
    return false;
  }

  // ==========================================
  // PIN RÁPIDO DE 4 DÍGITOS / OFFLINE
  // ==========================================

  static Future<void> saveQuickPin(String pin) async {
    _memCache[_quickPinKey] = pin;
    try {
      await _storage.write(key: _quickPinKey, value: pin);
    } catch (_) {}
  }

  static Future<bool> verifyQuickPin(String pin) async {
    final storedPin = await _getQuickPin();
    return storedPin != null && storedPin == pin;
  }

  static Future<bool> hasQuickPin() async {
    final storedPin = await _getQuickPin();
    return storedPin != null && storedPin.isNotEmpty;
  }

  static Future<String?> _getQuickPin() async {
    if (_memCache.containsKey(_quickPinKey)) {
      return _memCache[_quickPinKey];
    }
    try {
      final val = await _storage.read(key: _quickPinKey);
      if (val != null) {
        _memCache[_quickPinKey] = val;
        return val;
      }
    } catch (_) {}
    return _memCache[_quickPinKey];
  }

  static Future<void> removeQuickPin() async {
    _memCache.remove(_quickPinKey);
    try {
      await _storage.delete(key: _quickPinKey);
    } catch (_) {}
  }

  // ==========================================
  // USER PROFILE CACHE (OFFLINE RESILIENCE)
  // ==========================================

  static Future<void> saveCachedUser(String userJson) async {
    _memCache[_cachedUserKey] = userJson;
    try {
      await _storage.write(key: _cachedUserKey, value: userJson);
    } catch (_) {}
  }

  static Future<String?> getCachedUser() async {
    if (_memCache.containsKey(_cachedUserKey)) {
      return _memCache[_cachedUserKey];
    }
    try {
      final val = await _storage.read(key: _cachedUserKey);
      if (val != null) {
        _memCache[_cachedUserKey] = val;
        return val;
      }
    } catch (_) {}
    return _memCache[_cachedUserKey];
  }

  static Future<void> clearAll() async {
    _memCache.clear();
    try {
      await _storage.deleteAll();
    } catch (_) {}
  }
}