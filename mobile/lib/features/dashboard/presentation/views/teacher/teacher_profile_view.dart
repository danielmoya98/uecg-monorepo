import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../../../../core/widgets/swiss_header.dart';

class TeacherProfileView extends StatelessWidget {
  const TeacherProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        const SwissHeader(greeting: 'DOCENTE', title: 'MI PERFIL'),
        const SizedBox(height: 24),
        SwissCard(
          label: 'DATOS PERSONALES',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('NOMBRES Y APELLIDOS', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
              Text('Carlos Mendoza', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Text('DOCUMENTO DE IDENTIDAD', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
              Text('87654321 L.P.', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Text('CORREO INSTITUCIONAL', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
              Text('carlos.mendoza@cheguevara.edu.bo', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
            ],
          ),
          actionText: 'SOLICITAR ACTUALIZACIÓN',
          onAction: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Comuníquese con administración para cambiar sus datos.'),
                backgroundColor: AppTheme.inkBlack,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              ),
            );
          },
        ),
        SwissCard(
          label: 'PREFERENCIAS DEL SISTEMA',
          content: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('NOTIFICACIONES PUSH', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
                  Switch(value: true, onChanged: (val) {}, activeColor: AppTheme.swissBlue, activeTrackColor: AppTheme.swissBlue.withOpacity(0.2)),
                ],
              ),
              const Divider(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('CAMBIAR CONTRASEÑA', style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
                  const Icon(Icons.arrow_forward_ios, size: 16, color: AppTheme.slateGray),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.red.shade800,
              side: BorderSide(color: Colors.red.shade800, width: 1),
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            onPressed: () => context.go('/welcome'),
            child: const Text('CERRAR SESIÓN', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          ),
        ),
        const SizedBox(height: 48),
      ],
    );
  }
}