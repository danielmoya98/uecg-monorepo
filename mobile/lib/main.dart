import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_router.dart';
import 'core/services/push_notification_service.dart';
import 'core/services/secure_storage_service.dart';

void main() async {
  // 1. Asegurar que Flutter esté inicializado antes de llamar a código nativo
  WidgetsFlutterBinding.ensureInitialized();

  // 2. Inicializar almacenamiento persistente y servicios
  await SecureStorageService.init();
  await PushNotificationService.initializeApp();

  // 3. Correr la app
  runApp(const ProviderScope(child: UECGApp()));
}

class UECGApp extends StatelessWidget {
  const UECGApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'U.E. Ernesto Che Guevara',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.swissTheme,
      routerConfig: AppRouter.router,
    );
  }
}