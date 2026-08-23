import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_svg/flutter_svg.dart'; // <-- Paquete clave para SVG
import 'package:flutter_animate/flutter_animate.dart'; // <-- Paquete clave para animaciones pro
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/secure_storage_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  // Variables de control de estado para las animaciones matemáticas
  bool _isDotCenter = false;
  bool _isScaleTheCircle = false;
  bool _hideLogoAndText = false;

  @override
  void initState() {
    super.initState();
    // Iniciamos la secuencia de animación automáticamente
    _startAnimationSequence();
  }

  Future<void> _startAnimationSequence() async {
    // 1. Entrada escalonada del logo
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;

    // 2. VIAJE DEL PUNTO AL CENTRO
    setState(() => _isDotCenter = true);
    await Future.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;

    // 3. DETONACIÓN DE LA EXPLOSIÓN BLANCA
    setState(() {
      _hideLogoAndText = true;
      _isScaleTheCircle = true;
    });
    await Future.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;

    // 4. NAVEGACIÓN ENRUTADA POR RIVERPOD
    _checkAuthAndNavigate();
  }

  Future<void> _checkAuthAndNavigate() async {
    final authState = ref.read(authProvider);

    if (authState.status == AuthStatus.authenticated && authState.user != null) {
      final role = (authState.user?['role'] ?? 'ESTUDIANTE').toString().toUpperCase();
      if (role == 'DOCENTE' || role.contains('TEACHER')) {
        context.go('/dashboard/teacher');
      } else if (role == 'PADRE' || role == 'TUTOR' || role.contains('GUARDIAN')) {
        context.go('/dashboard/parent');
      } else {
        context.go('/dashboard/student');
      }
      return;
    }

    final hasSeenOnboarding = await SecureStorageService.hasSeenOnboarding();
    if (!mounted) return;
    if (hasSeenOnboarding) {
      context.go('/welcome');
    } else {
      context.go('/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Obtenemos el tamaño de la pantalla para cálculos matemáticos precisos
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: AppTheme.swissBlue,
      body: SizedBox(
        height: double.infinity,
        width: double.infinity,
        child: Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            // ========================================================
            // 1. EL CÍRCULO DE EXPLOSIÓN BLANCA (FONDO REVEAL)
            // ========================================================
            Center(
              child: AnimatedScale(
                duration: const Duration(milliseconds: 600),
                curve: const Cubic(0.58, -0.30, 0.365, 1),
                // 🔥 SOLUCIÓN: Empieza con escala CERO o está invisible.
                // Usamos 15 para asegurar llenado completo en pantallas largas.
                scale: _isScaleTheCircle ? 15 : 0.0,
                child: Container(
                  width: 96,
                  height: 96,
                  decoration: const BoxDecoration(
                    color: AppTheme.pureWhite,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),

            // ========================================================
            // 2. EL ENSAMBLE DEL EMBLEMA (Logo + Tipografía)
            // ========================================================
            Center(
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 200),
                opacity: _hideLogoAndText ? 0.0 : 1.0,
                // Englobamos el SVG y el Texto para animar su entrada juntos
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // El Logo SVG (Pintado de blanco puro)
                    SvgPicture.asset(
                      'assets/lg.svg',
                      width: 170, // Espacio negativo equilibrado
                      // 🔥 Esto pinta tu SVG azul de color blanco puro para contrastar
                      colorFilter: const ColorFilter.mode(
                          AppTheme.pureWhite, BlendMode.srcIn),
                    ),
                    const SizedBox(height: 32),

                    // 🚀 Tensión Tipográfica Extrema (Pedestal moderno)
                    Text(
                      'U.E.C.G.',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppTheme.pureWhite,
                            letterSpacing:
                                16.0, // Espaciado extremo premium institucional
                            fontWeight: FontWeight.w900, // Peso pesado
                            fontSize: 10, // Pequeño y preciso
                          ),
                    ),
                  ],
                )
                    // 🚀 ENTRADA ESCALONADA (Declarativa con flutter_animate)
                    .animate()
                    .fade(duration: 1000.ms, curve: Curves.easeInCirc)
                    .slideY(
                        begin: 0.1,
                        duration: 1200.ms,
                        curve: Curves
                            .easeOutQuart), // Flota sutilmente hacia arriba
              ),
            ),

            // ========================================================
            // 3. EL PUNTO VIAJERO (Geometric Storytelling en eje vertical)
            // ========================================================
            AnimatedPositioned(
              duration: const Duration(milliseconds: 500),
              curve:
                  const Cubic(.47, -1.26, .36, 1), // Efecto "tirachinas" suizo
              // Cálculo matemático: Mitad de pantalla - radio del punto - desplazamiento vertical
              // 🔥 SOLUCIÓN: El punto ya no está a la izquierda. Está abajo. alineado matemáticamente.
              top: (screenHeight / 2) -
                  12 -
                  (_isDotCenter ? 0 : -250), // Empieza 250px abajo del centro
              child: Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: AppTheme.pureWhite,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
