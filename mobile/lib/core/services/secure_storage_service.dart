import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorageService {
  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
      resetOnError: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  static SharedPreferences? _prefs;
  static final Map<String, String> _memCache = {};

  static const _tokenKey = 'uecg_jwt_token';
  static const _refreshTokenKey = 'uecg_refresh_token';
  static const _quickPinKey = 'uecg_quick_pin_hash';
  static const _cachedUserKey = 'uecg_cached_user_profile';
  static const _onboardingSeenKey = 'uecg_onboarding_seen';

  // ==========================================
  // INICIALIZACIÓN PREVIA EN MAIN()
  // ==========================================

  static Future<void> init() async {
    try {
      _prefs = await SharedPreferences.getInstance();
      
      // Precarga de valores en memoria para acceso síncrono instantáneo
      final token = _prefs?.getString(_tokenKey);
      if (token != null && token.isNotEmpty) _memCache[_tokenKey] = token;

      final refreshToken = _prefs?.getString(_refreshTokenKey);
      if (refreshToken != null && refreshToken.isNotEmpty) _memCache[_refreshTokenKey] = refreshToken;

      final pin = _prefs?.getString(_quickPinKey);
      if (pin != null && pin.isNotEmpty) _memCache[_quickPinKey] = pin;

      final user = _prefs?.getString(_cachedUserKey);
      if (user != null && user.isNotEmpty) _memCache[_cachedUserKey] = user;

      final onboarding = _prefs?.getString(_onboardingSeenKey);
      if (onboarding != null) _memCache[_onboardingSeenKey] = onboarding;
    } catch (_) {}
  }

  // ==========================================
  // TOKENS (ACCESS TOKEN & REFRESH TOKEN)
  // ==========================================

  static Future<void> saveToken(String token) async {
    _memCache[_tokenKey] = token;
    _prefs?.setString(_tokenKey, token);
    try {
      await _secureStorage.write(key: _tokenKey, value: token);
    } catch (_) {}
  }

  static Future<String?> getToken() async {
    if (_memCache.containsKey(_tokenKey) && _memCache[_tokenKey] != null && _memCache[_tokenKey]!.isNotEmpty) {
      return _memCache[_tokenKey];
    }
    final fromPrefs = _prefs?.getString(_tokenKey);
    if (fromPrefs != null && fromPrefs.isNotEmpty) {
      _memCache[_tokenKey] = fromPrefs;
      return fromPrefs;
    }
    try {
      final val = await _secureStorage.read(key: _tokenKey);
      if (val != null && val.isNotEmpty) {
        _memCache[_tokenKey] = val;
        _prefs?.setString(_tokenKey, val);
        return val;
      }
    } catch (_) {}
    return null;
  }

  static Future<void> saveRefreshToken(String token) async {
    _memCache[_refreshTokenKey] = token;
    _prefs?.setString(_refreshTokenKey, token);
    try {
      await _secureStorage.write(key: _refreshTokenKey, value: token);
    } catch (_) {}
  }

  static Future<String?> getRefreshToken() async {
    if (_memCache.containsKey(_refreshTokenKey) && _memCache[_refreshTokenKey] != null && _memCache[_refreshTokenKey]!.isNotEmpty) {
      return _memCache[_refreshTokenKey];
    }
    final fromPrefs = _prefs?.getString(_refreshTokenKey);
    if (fromPrefs != null && fromPrefs.isNotEmpty) {
      _memCache[_refreshTokenKey] = fromPrefs;
      return fromPrefs;
    }
    try {
      final val = await _secureStorage.read(key: _refreshTokenKey);
      if (val != null && val.isNotEmpty) {
        _memCache[_refreshTokenKey] = val;
        _prefs?.setString(_refreshTokenKey, val);
        return val;
      }
    } catch (_) {}
    return null;
  }

  static Future<void> deleteToken() async {
    _memCache.remove(_tokenKey);
    _memCache.remove(_refreshTokenKey);
    _memCache.remove(_cachedUserKey);
    _prefs?.remove(_tokenKey);
    _prefs?.remove(_refreshTokenKey);
    _prefs?.remove(_cachedUserKey);
    try {
      await _secureStorage.delete(key: _tokenKey);
      await _secureStorage.delete(key: _refreshTokenKey);
      await _secureStorage.delete(key: _cachedUserKey);
    } catch (_) {}
  }

  // ==========================================
  // ONBOARDING FIRST-TIME TRACKER
  // ==========================================

  static Future<void> setOnboardingSeen(bool seen) async {
    _memCache[_onboardingSeenKey] = seen ? 'true' : 'false';
    _prefs?.setString(_onboardingSeenKey, seen ? 'true' : 'false');
    try {
      await _secureStorage.write(key: _onboardingSeenKey, value: seen ? 'true' : 'false');
    } catch (_) {}
  }

  static Future<bool> hasSeenOnboarding() async {
    if (_memCache.containsKey(_onboardingSeenKey)) {
      return _memCache[_onboardingSeenKey] == 'true';
    }
    final fromPrefs = _prefs?.getString(_onboardingSeenKey);
    if (fromPrefs != null) {
      _memCache[_onboardingSeenKey] = fromPrefs;
      return fromPrefs == 'true';
    }
    try {
      final val = await _secureStorage.read(key: _onboardingSeenKey);
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
    _prefs?.setString(_quickPinKey, pin);
    try {
      await _secureStorage.write(key: _quickPinKey, value: pin);
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
    if (_memCache.containsKey(_quickPinKey) && _memCache[_quickPinKey] != null && _memCache[_quickPinKey]!.isNotEmpty) {
      return _memCache[_quickPinKey];
    }
    final fromPrefs = _prefs?.getString(_quickPinKey);
    if (fromPrefs != null && fromPrefs.isNotEmpty) {
      _memCache[_quickPinKey] = fromPrefs;
      return fromPrefs;
    }
    try {
      final val = await _secureStorage.read(key: _quickPinKey);
      if (val != null && val.isNotEmpty) {
        _memCache[_quickPinKey] = val;
        _prefs?.setString(_quickPinKey, val);
        return val;
      }
    } catch (_) {}
    return null;
  }

  static Future<void> removeQuickPin() async {
    _memCache.remove(_quickPinKey);
    _prefs?.remove(_quickPinKey);
    try {
      await _secureStorage.delete(key: _quickPinKey);
    } catch (_) {}
  }

  // ==========================================
  // USER PROFILE CACHE (OFFLINE RESILIENCE)
  // ==========================================

  static Future<void> saveCachedUser(String userJson) async {
    _memCache[_cachedUserKey] = userJson;
    _prefs?.setString(_cachedUserKey, userJson);
    try {
      await _secureStorage.write(key: _cachedUserKey, value: userJson);
    } catch (_) {}
  }

  static Future<String?> getCachedUser() async {
    if (_memCache.containsKey(_cachedUserKey) && _memCache[_cachedUserKey] != null && _memCache[_cachedUserKey]!.isNotEmpty) {
      return _memCache[_cachedUserKey];
    }
    final fromPrefs = _prefs?.getString(_cachedUserKey);
    if (fromPrefs != null && fromPrefs.isNotEmpty) {
      _memCache[_cachedUserKey] = fromPrefs;
      return fromPrefs;
    }
    try {
      final val = await _secureStorage.read(key: _cachedUserKey);
      if (val != null && val.isNotEmpty) {
        _memCache[_cachedUserKey] = val;
        _prefs?.setString(_cachedUserKey, val);
        return val;
      }
    } catch (_) {}
    return null;
  }

  static Future<void> clearAll() async {
    _memCache.clear();
    _prefs?.clear();
    try {
      await _secureStorage.deleteAll();
    } catch (_) {}
  }
}