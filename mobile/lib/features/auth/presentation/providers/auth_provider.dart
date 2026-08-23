import 'dart:convert';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/services/secure_storage_service.dart';
import '../../data/auth_repository.dart';

part 'auth_provider.g.dart';

enum AuthStatus { checking, unauthenticated, authenticated }

class AuthState {
  final AuthStatus status;
  final Map<String, dynamic>? user;
  final String errorMessage;
  final bool isOffline;

  AuthState({
    this.status = AuthStatus.checking,
    this.user,
    this.errorMessage = '',
    this.isOffline = false,
  });

  AuthState copyWith({
    AuthStatus? status,
    Map<String, dynamic>? user,
    String? errorMessage,
    bool? isOffline,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
      isOffline: isOffline ?? this.isOffline,
    );
  }
}

@Riverpod(keepAlive: true)
class Auth extends _$Auth {
  late final AuthRepository _repository;

  @override
  AuthState build() {
    _repository = AuthRepository();
    Future.microtask(() => checkAuthStatus());
    return AuthState();
  }

  // PANTALLA 1: SPLASH SCREEN CHECKER
  Future<void> checkAuthStatus() async {
    final token = await SecureStorageService.getToken();
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }

    await refreshProfile();
  }

  // REFRESCAR PERFIL O USAR CACHÉ OFFLINE
  Future<void> refreshProfile() async {
    try {
      final freshUserData = await _repository.getGuardianProfile();
      await SecureStorageService.saveCachedUser(jsonEncode(freshUserData));
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: freshUserData,
        errorMessage: '',
        isOffline: false,
      );
    } catch (e) {
      final cachedJson = await SecureStorageService.getCachedUser();
      if (cachedJson != null) {
        try {
          final cachedUser = jsonDecode(cachedJson) as Map<String, dynamic>;
          state = state.copyWith(
            status: AuthStatus.authenticated,
            user: cachedUser,
            isOffline: true,
          );
          return;
        } catch (_) {}
      }

      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      if (!errorMsg.contains('conectar')) {
        logout();
      }
    }
  }

  // LOGIN
  Future<bool> login(String identifier, String password) async {
    try {
      final user = await _repository.login(identifier, password);
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        errorMessage: '',
        isOffline: false,
      );

      await refreshProfile();
      return true;
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      return false;
    }
  }

  // PIN RÁPIDO DE 4 DÍGITOS Y DESBLOQUEO
  Future<void> setQuickPin(String pin) async {
    await SecureStorageService.saveQuickPin(pin);
  }

  Future<bool> unlockWithPin(String pin) async {
    final isValid = await SecureStorageService.verifyQuickPin(pin);
    if (isValid) {
      await refreshProfile();
      return true;
    }
    return false;
  }

  Future<bool> hasQuickPin() async {
    return await SecureStorageService.hasQuickPin();
  }

  Future<void> removeQuickPin() async {
    await SecureStorageService.removeQuickPin();
  }

  // AUTORIZAR LOGIN POR QR EN WEB (Docente)
  Future<bool> authorizeWebQr(String challengeId) async {
    try {
      return await _repository.authorizeWebQr(challengeId);
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      return false;
    }
  }

  // SESIONES MULTIDISPOSITIVO
  Future<List<Map<String, dynamic>>> getUserSessions() async {
    return await _repository.getUserSessions();
  }

  Future<bool> revokeSession(String sessionId) async {
    return await _repository.revokeSession(sessionId);
  }

  Future<bool> revokeOtherSessions() async {
    return await _repository.revokeOtherSessions();
  }

  // REGISTRO PADRE / TUTOR
  Future<bool> registerGuardian(String ci, String email, String password) async {
    try {
      final user = await _repository.registerGuardian(ci, email, password);
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        errorMessage: '',
      );
      return true;
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      return false;
    }
  }

  // REGISTRO ESTUDIANTE
  Future<bool> registerStudent(String ci, String birthDate, String email, String password) async {
    try {
      final user = await _repository.registerStudent(ci, birthDate, email, password);
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        errorMessage: '',
      );
      return true;
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      return false;
    }
  }

  // RECUPERACIÓN DE CONTRASEÑA
  Future<bool> forgotPassword(String identifier) async {
    try {
      await _repository.forgotPassword(identifier);
      return true;
    } catch (e) {
      state = state.copyWith(
        errorMessage: 'No se pudo enviar el código. Verifique su dato.',
      );
      return false;
    }
  }

  Future<bool> resetPassword(String identifier, String code, String newPassword) async {
    try {
      await _repository.resetPassword(identifier, code, newPassword);
      return true;
    } catch (e) {
      state = state.copyWith(errorMessage: 'Código inválido o expirado.');
      return false;
    }
  }

  // CERRAR SESIÓN
  void logout() async {
    await SecureStorageService.deleteToken();
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      user: null,
      isOffline: false,
    );
  }
}
