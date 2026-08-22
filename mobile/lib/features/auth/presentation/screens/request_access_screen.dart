import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/swiss_background.dart';

class RequestAccessScreen extends ConsumerWidget {
  const RequestAccessScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.inkBlack),
        bottom: const PreferredSize(
            preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
      ),
      body: SwissBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('NUEVO INGRESO', style: textTheme.labelSmall)
                  .animate()
                  .fade()
                  .slideY(begin: 0.2),
              const SizedBox(height: 8),
              Text('SOLICITAR\nACCESO', style: textTheme.displayLarge)
                  .animate()
                  .fade(delay: 100.ms)
                  .slideY(begin: 0.2),
              const SizedBox(height: 24),

              // 🔥 Acento Suizo
              Container(width: 64, height: 4, color: AppTheme.swissBlue)
                  .animate()
                  .fade(delay: 150.ms)
                  .scaleX(
                      alignment: Alignment.centerLeft,
                      duration: 600.ms,
                      curve: Curves.easeOutExpo),

              const SizedBox(height: 48),

              Text(
                'Complete los datos. La administración validará su identidad antes de otorgar las credenciales.',
                style: textTheme.bodyLarge,
              ).animate().fade(delay: 200.ms),
              const SizedBox(height: 32),

              _buildSwissTextField(context, 'NOMBRES Y APELLIDOS', false)
                  .animate()
                  .fade(delay: 300.ms)
                  .slideX(begin: 0.05),
              const SizedBox(height: 24),
              _buildSwissTextField(context, 'CÉDULA DE IDENTIDAD', false)
                  .animate()
                  .fade(delay: 400.ms)
                  .slideX(begin: 0.05),
              const SizedBox(height: 24),
              _buildSwissTextField(
                      context, 'CORREO ELECTRÓNICO (OPCIONAL)', false)
                  .animate()
                  .fade(delay: 500.ms)
                  .slideX(begin: 0.05),

              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.inkBlack,
                    foregroundColor: AppTheme.pureWhite,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text('ENVIAR SOLICITUD',
                      style: TextStyle(
                          letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                ),
              ).animate().fade(delay: 600.ms).scaleXY(begin: 0.95),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSwissTextField(
      BuildContext context, String label, bool isPassword) {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: textTheme.labelSmall),
        const SizedBox(height: 8),
        TextFormField(
          obscureText: isPassword,
          style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack),
          decoration: const InputDecoration(
            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: AppTheme.lineGray, width: 1)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: AppTheme.swissBlue, width: 2)),
          ),
        ),
      ],
    );
  }
}
