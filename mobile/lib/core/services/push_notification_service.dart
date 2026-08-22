import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../features/auth/data/auth_repository.dart';
import '../services/secure_storage_service.dart';

// 1. Manejador de notificaciones cuando la app está CERRADA (Background)
// OJO: Esta función debe estar FUERA de cualquier clase (Top-level)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("Mensaje en background recibido: ${message.messageId}");
}

class PushNotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  // 2. Inicialización principal
  static Future<void> initializeApp() async {
    // Inicializar Firebase
    await Firebase.initializeApp();

    // Registrar el handler de background
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Pedir permisos (Crítico para iOS y Android 13+)
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('Permiso de notificaciones concedido.');

      // Obtener el Token actual
      String? token = await _messaging.getToken();
      if (token != null) {
        print("FCM Token Actual: $token");
        await _sendTokenToNestJS(token);
      }

      // 🔥 NUEVO: Escuchar si Google rota el token de Firebase automáticamente
      _messaging.onTokenRefresh.listen((newToken) async {
        print("🔄 El FCM Token fue rotado por Firebase");
        await _sendTokenToNestJS(newToken);
      });

      // 3. Escuchar notificaciones (App Abierta o en Segundo Plano)
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      // 4. Escuchar si se abrió la app desde una notificación estando CERRADA
      RemoteMessage? initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        _handleNotificationTap(initialMessage);
      }
    }
  }

  // 5. Lógica de Intercepción del Payload (El Contrato)
  static void _handleNotificationTap(RemoteMessage message) {
    if (message.data.containsKey('updateUrl')) {
      final String url = message.data['updateUrl'];
      _launchInAppWebView(url);
    }
  }

  // 6. La Magia del In-App Browser (Swiss Style: sin salir de la app)
  static Future<void> _launchInAppWebView(String urlStr) async {
    final Uri url = Uri.parse(urlStr);
    if (!await launchUrl(
      url,
      mode: LaunchMode.inAppWebView,
      webViewConfiguration: const WebViewConfiguration(enableJavaScript: true),
    )) {
      print('Error crítico: No se pudo abrir $url');
    }
  }

  // 7. 🔥 Envío real del token a NestJS (Si la sesión está iniciada)
  static Future<void> _sendTokenToNestJS(String fcmToken) async {
    // Verificamos si hay un usuario logueado antes de intentar enviarlo.
    final jwtToken = await SecureStorageService.getToken();

    if (jwtToken != null) {
      final authRepo = AuthRepository();
      await authRepo.syncFcmToken(fcmToken);
    } else {
      print("Token FCM generado, pero no se envió a NestJS porque no hay sesión iniciada (No hay JWT).");
    }
  }
}