import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/services/secure_storage_service.dart';
import '../../data/auth_repository.dart';

// 1. OBLIGATORIO: Declarar el archivo generado
part 'auth_provider.g.dart';

// Estado de la autenticación (Se mantiene tu excelente arquitectura)
enum AuthStatus { checking, unauthenticated, authenticated }

class AuthState {
  final AuthStatus status;
  final Map<String, dynamic>? user;
  final String errorMessage;

  AuthState(
      {this.status = AuthStatus.checking, this.user, this.errorMessage = ''});

  AuthState copyWith(
      {AuthStatus? status, Map<String, dynamic>? user, String? errorMessage}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

// 2. Anotación de Riverpod (keepAlive evita que se destruya al cambiar de pantalla)
@Riverpod(keepAlive: true)
class Auth extends _$Auth {
  late final AuthRepository _repository;

  // 3. El método build() reemplaza al constructor original
  @override
  AuthState build() {
    _repository = AuthRepository();

    // Ejecutamos la revisión de token en segundo plano apenas se construye el provider
    Future.microtask(() => checkAuthStatus());

    // Retornamos el estado inicial sincrónico
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

  // MÉTODO PARA TRAER DATOS FRESCOS DEL BACKEND
  Future<void> refreshProfile() async {
    try {
      final freshUserData = await _repository.getGuardianProfile();
      state = state.copyWith(
          status: AuthStatus.authenticated,
          user: freshUserData,
          errorMessage: '');
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      if (!errorMsg.contains('conectar')) {
        logout();
      }
    }
  }

  // PANTALLA 3: LOGIN
  Future<bool> login(String identifier, String password) async {
    try {
      final user = await _repository.login(identifier, password);
      state = state.copyWith(
          status: AuthStatus.authenticated, user: user, errorMessage: '');

      await refreshProfile();

      return true;
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      return false;
    }
  }

  // PANTALLA 4: REGISTRO PADRE / TUTOR
  Future<bool> registerGuardian(
      String ci, String email, String password) async {
    try {
      final user = await _repository.registerGuardian(ci, email, password);
      state = state.copyWith(
          status: AuthStatus.authenticated, user: user, errorMessage: '');
      return true;
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      return false;
    }
  }

  // PANTALLA 4: REGISTRO ESTUDIANTE
  Future<bool> registerStudent(
      String ci, String birthDate, String email, String password) async {
    try {
      final user =
          await _repository.registerStudent(ci, birthDate, email, password);
      state = state.copyWith(
          status: AuthStatus.authenticated, user: user, errorMessage: '');
      return true;
    } catch (e) {
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      state = state.copyWith(errorMessage: errorMsg);
      return false;
    }
  }

  // PANTALLA 5: SOLICITAR CÓDIGO DE RECUPERACIÓN
  Future<bool> forgotPassword(String identifier) async {
    try {
      await _repository.forgotPassword(identifier);
      return true;
    } catch (e) {
      state = state.copyWith(
          errorMessage: 'No se pudo enviar el código. Verifique su dato.');
      return false;
    }
  }

  // PANTALLA 5: CAMBIAR CONTRASEÑA
  Future<bool> resetPassword(
      String identifier, String code, String newPassword) async {
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
    state = state.copyWith(status: AuthStatus.unauthenticated, user: null);
  }
}
