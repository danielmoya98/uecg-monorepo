import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/theme/app_theme.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: AppTheme.pureWhite,
      body: Stack(
        children: [
          // 1. MARCA DE AGUA INSTITUCIONAL (Hero Graphic)
          Positioned(
            top: -50,
            right: -screenWidth * 0.4,
            child: Opacity(
              opacity: 0.03, // Textura sutil
              child: SvgPicture.asset(
                'assets/lg.svg',
                width: screenWidth * 1.2,
                colorFilter:
                    const ColorFilter.mode(AppTheme.inkBlack, BlendMode.srcIn),
              ),
            ),
          )
              .animate()
              .fade(duration: 1500.ms)
              .scaleXY(begin: 1.1, end: 1.0, curve: Curves.easeOutQuart),

          // 2. CONTENIDO PRINCIPAL
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 32.0, vertical: 48.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('PORTAL', style: textTheme.labelSmall)
                            .animate()
                            .fade(duration: 500.ms)
                            .slideY(begin: 0.5, curve: Curves.easeOutQuart),
                        const SizedBox(height: 16),
                        Text('ACCESO AL\nSISTEMA',
                                style: textTheme.displayLarge)
                            .animate()
                            .fade(delay: 100.ms, duration: 600.ms)
                            .slideY(begin: 0.2, curve: Curves.easeOutQuart),
                        const SizedBox(height: 32),

                        // 🔥 Acento Suizo
                        Container(
                                width: 64, height: 4, color: AppTheme.swissBlue)
                            .animate()
                            .fade(delay: 200.ms)
                            .scaleX(
                                alignment: Alignment.centerLeft,
                                duration: 600.ms,
                                curve: Curves.easeOutExpo),

                        const SizedBox(height: 32),
                        Text(
                          'Identifíquese con sus credenciales institucionales o registre su identidad en el sistema.',
                          style: textTheme.bodyLarge?.copyWith(height: 1.5),
                        ).animate().fade(delay: 300.ms, duration: 600.ms),
                      ],
                    ),
                  ),
                ),

                // 3. BOTONES FLOTANTES
                Padding(
                  padding: const EdgeInsets.only(
                      left: 32.0, right: 32.0, bottom: 48.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.swissBlue,
                          foregroundColor: AppTheme.pureWhite,
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.zero),
                        ),
                        onPressed: () => context.push('/login'),
                        child: const Text('INICIAR SESIÓN',
                            style: TextStyle(
                                letterSpacing: 1.5,
                                fontWeight: FontWeight.bold)),
                      )
                          .animate()
                          .fade(delay: 400.ms)
                          .slideY(begin: 0.3, curve: Curves.easeOutQuart),
                      const SizedBox(height: 16),
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.inkBlack,
                          side: const BorderSide(
                              color: AppTheme.inkBlack, width: 1.5),
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.zero),
                        ),
                        onPressed: () => context.push('/register'),
                        child: const Text('CREAR MI CUENTA',
                            style: TextStyle(
                                letterSpacing: 1.5,
                                fontWeight: FontWeight.bold)),
                      )
                          .animate()
                          .fade(delay: 500.ms)
                          .slideY(begin: 0.3, curve: Curves.easeOutQuart),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
