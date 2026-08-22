import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../../../../core/widgets/swiss_header.dart';

class StudentProfileView extends StatelessWidget {
  const StudentProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        const SwissHeader(greeting: 'ESTUDIANTE', title: 'MI PERFIL'),
        const SizedBox(height: 24),
        SwissCard(
          label: 'DATOS ACADÉMICOS',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('NOMBRES Y APELLIDOS', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
              Text('Juan Pérez', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Text('CÓDIGO RUDE', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
              Text('12345678901234', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        SwissCard(
          label: 'DATOS DEL TUTOR',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('TUTOR ASIGNADO', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
              Text('María Pérez', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            style: OutlinedButton.styleFrom(foregroundColor: Colors.red.shade800, side: BorderSide(color: Colors.red.shade800, width: 1), shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero), padding: const EdgeInsets.symmetric(vertical: 16)),
            onPressed: () => context.go('/welcome'),
            child: const Text('CERRAR SESIÓN', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          ),
        ),
      ],
    );
  }
}