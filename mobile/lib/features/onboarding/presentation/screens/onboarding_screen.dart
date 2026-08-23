import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/secure_storage_service.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, String>> _pages = [
    {
      "label": "EXPLORAR",
      "title": "ESTUDIANTES Y TUTORES",
      "body":
          "Acceso directo a calificaciones, horarios y comunicados oficiales de la institución educativa.",
    },
    {
      "label": "DESCUBRIR",
      "title": "PLANTEL DOCENTE",
      "body":
          "Gestión académica objetiva. Registro de asistencia y evaluación continua en tiempo real.",
    },
    {
      "label": "CREAR",
      "title": "ADMINISTRACIÓN",
      "body":
          "Control centralizado de la unidad educativa. Monitoreo de métricas y gestión de usuarios.",
    },
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: AppTheme.pureWhite,
      body: Stack(
        children: [
          // 1. FONDO GEOMÉTRICO ESTÁTICO (Mantiene la tensión del Swiss Style)
          Positioned(
            top: -screenWidth * 0.2,
            right: -screenWidth * 0.2,
            child: Container(
              width: screenWidth * 0.8,
              height: screenWidth * 0.8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.lineGray.withOpacity(0.3),
              ),
            ),
          ),
          Positioned(
            bottom: -screenWidth * 0.3,
            left: -screenWidth * 0.1,
            child: Container(
              width: screenWidth * 0.9,
              height: screenWidth * 0.9,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                    color: AppTheme.lineGray.withOpacity(0.5), width: 2),
              ),
            ),
          ),

          // 2. CONTENIDO PRINCIPAL
          SafeArea(
            child: Column(
              children: [
                // Indicador superior minimalista
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 32.0, vertical: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('U.E.C.G.',
                          style: textTheme.labelSmall?.copyWith(
                              letterSpacing: 4.0, color: AppTheme.inkBlack)),
                      Text('0${_currentPage + 1} / 0${_pages.length}',
                          style: textTheme.labelSmall
                              ?.copyWith(color: AppTheme.slateGray)),
                    ],
                  ),
                ),

                // Carrusel de contenido
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    physics: const BouncingScrollPhysics(),
                    onPageChanged: (index) =>
                        setState(() => _currentPage = index),
                    itemCount: _pages.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 40.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // 🚀 TUS ILUSTRACIONES SVG ANIMADAS
                            SizedBox(
                              height: 280,
                              child: Center(
                                child: _buildAbstractArt(index),
                              ),
                            ),
                            const SizedBox(height: 48),

                            // 📝 TIPOGRAFÍA CENTRADA
                            Text(
                              _pages[index]["label"]!,
                              style: textTheme.labelSmall?.copyWith(
                                  color: AppTheme.swissBlue,
                                  letterSpacing: 3.0),
                            )
                                .animate(key: ValueKey('label_$index'))
                                .fade(duration: 400.ms)
                                .slideY(begin: 0.5),

                            const SizedBox(height: 16),

                            Text(
                              _pages[index]["title"]!,
                              textAlign: TextAlign.center,
                              style: textTheme.displayLarge
                                  ?.copyWith(fontSize: 28, height: 1.1),
                            )
                                .animate(key: ValueKey('title_$index'))
                                .fade(delay: 100.ms, duration: 400.ms)
                                .slideY(begin: 0.2),

                            const SizedBox(height: 24),

                            Text(
                              _pages[index]["body"]!,
                              textAlign: TextAlign.center,
                              style: textTheme.bodyLarge?.copyWith(height: 1.5),
                            )
                                .animate(key: ValueKey('body_$index'))
                                .fade(delay: 200.ms, duration: 400.ms),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // 3. BARRA DE NAVEGACIÓN INFERIOR
                Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: _currentPage == _pages.length - 1
                        // BOTÓN FINAL
                        ? SizedBox(
                            key: const ValueKey('btn_final'),
                            width: double.infinity,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.swissBlue,
                                foregroundColor: AppTheme.pureWhite,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 24),
                                shape: const RoundedRectangleBorder(
                                    borderRadius: BorderRadius.zero),
                              ),
                              onPressed: () async {
                                await SecureStorageService.setOnboardingSeen(true);
                                if (context.mounted) context.go('/welcome');
                              },
                              child: const Text('INGRESAR AL SISTEMA',
                                  style: TextStyle(
                                      letterSpacing: 2.0,
                                      fontWeight: FontWeight.bold)),
                            ),
                          )
                        // CONTROLES DE NAVEGACIÓN
                        : Row(
                            key: const ValueKey('btn_nav'),
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              TextButton(
                                onPressed: () async {
                                  await SecureStorageService.setOnboardingSeen(true);
                                  if (context.mounted) context.go('/welcome');
                                },
                                style: TextButton.styleFrom(
                                    foregroundColor: AppTheme.slateGray),
                                child: Text('SALTAR',
                                    style: textTheme.labelSmall
                                        ?.copyWith(color: AppTheme.slateGray)),
                              ),
                              GestureDetector(
                                onTap: () {
                                  _pageController.nextPage(
                                      duration:
                                          const Duration(milliseconds: 500),
                                      curve: Curves.easeOutQuart);
                                },
                                child: Container(
                                  width: 56,
                                  height: 56,
                                  decoration: const BoxDecoration(
                                    color: AppTheme.inkBlack,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.arrow_forward,
                                      color: AppTheme.pureWhite),
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // =======================================================================
  // RENDERIZADOR DE ILUSTRACIONES SVG
  // =======================================================================
  Widget _buildAbstractArt(int index) {
    // Array con las rutas exactas de tus archivos descargados
    final svgPaths = [
      'assets/student.svg', // Índice 0
      'assets/gammar.svg', // Índice 1
      'assets/family.svg', // Índice 2
    ];

    return SvgPicture.asset(
      svgPaths[index],
      height: 240, // Altura controlada para mantener el equilibrio visual
    )
        // Se mantiene la animación premium al cambiar de página
        .animate(key: ValueKey('svg_$index'))
        .fade(duration: 800.ms)
        .scaleXY(begin: 0.9, curve: Curves.easeOutQuart);
  }
}
