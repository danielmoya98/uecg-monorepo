import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../../../../core/widgets/swiss_header.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../auth/presentation/widgets/connected_devices_modal.dart';
import '../../../../auth/presentation/widgets/pin_setup_modal.dart';

class ParentProfileView extends ConsumerWidget {
  const ParentProfileView({super.key});

  void _showConnectedDevices(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const ConnectedDevicesModal(),
    );
  }

  void _showPinSetup(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const PinSetupModal(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textTheme = Theme.of(context).textTheme;
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final fullName = user?['fullName'] ?? 'Tutor de Familia';
    final email = user?['email'] ?? '';

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        const SwissHeader(greeting: 'TUTOR', title: 'MI PERFIL'),
        const SizedBox(height: 24),

        SwissCard(
          label: 'DATOS DEL TUTOR',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('NOMBRE COMPLETO',
                  style: textTheme.labelSmall
                      ?.copyWith(color: AppTheme.slateGray)),
              Text(fullName,
                  style: textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.bold, color: AppTheme.inkBlack)),
              if (email.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text('CORREO',
                    style: textTheme.labelSmall
                        ?.copyWith(color: AppTheme.slateGray)),
                Text(email,
                    style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.inkBlack)),
              ],
            ],
          ),
        ),

        const SizedBox(height: 16),
        SwissCard(
          label: 'ESTUDIANTES A CARGO (HIJOS)',
          content: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Juan Pérez',
                          style: textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppTheme.inkBlack)),
                      Text('3ro de Secundaria "A"',
                          style: textTheme.labelSmall
                              ?.copyWith(color: AppTheme.slateGray)),
                    ],
                  ),
                  const Icon(Icons.check_circle, color: AppTheme.swissBlue),
                ],
              ),
              const Divider(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Ana Pérez',
                          style: textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppTheme.inkBlack)),
                      Text('6to de Primaria "B"',
                          style: textTheme.labelSmall
                              ?.copyWith(color: AppTheme.slateGray)),
                    ],
                  ),
                  const Icon(Icons.circle_outlined, color: AppTheme.lineGray),
                ],
              ),
            ],
          ),
          actionText: 'AÑADIR OTRO ESTUDIANTE',
          onAction: () {},
        ),

        const SizedBox(height: 16),
        SwissCard(
          label: 'SEGURIDAD Y ACCESO',
          content: Column(
            children: [
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  color: AppTheme.inkBlack.withOpacity(0.05),
                  child: const Icon(Icons.devices_outlined,
                      color: AppTheme.inkBlack, size: 20),
                ),
                title: Text('DISPOSITIVOS CONECTADOS',
                    style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.inkBlack)),
                subtitle: const Text('Ver sesiones activas y cerrar remotas',
                    style: TextStyle(fontSize: 10, color: AppTheme.slateGray)),
                trailing: const Icon(Icons.arrow_forward_ios,
                    size: 14, color: AppTheme.slateGray),
                onTap: () => _showConnectedDevices(context),
              ),
              const Divider(height: 16),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  color: AppTheme.inkBlack.withOpacity(0.05),
                  child: const Icon(Icons.pin_outlined,
                      color: AppTheme.inkBlack, size: 20),
                ),
                title: Text('PIN DE ACCESO RÁPIDO',
                    style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.inkBlack)),
                subtitle: const Text('Acceso veloz y modo sin internet',
                    style: TextStyle(fontSize: 10, color: AppTheme.slateGray)),
                trailing: const Icon(Icons.arrow_forward_ios,
                    size: 14, color: AppTheme.slateGray),
                onTap: () => _showPinSetup(context),
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
              shape:
                  const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              context.go('/welcome');
            },
            child: const Text('CERRAR SESIÓN',
                style: TextStyle(
                    fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          ),
        ),
        const SizedBox(height: 48),
      ],
    );
  }
}