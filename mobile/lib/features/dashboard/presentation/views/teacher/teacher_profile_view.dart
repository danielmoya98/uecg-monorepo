import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../../../../core/widgets/swiss_header.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../auth/presentation/widgets/connected_devices_modal.dart';
import '../../../../auth/presentation/widgets/pin_setup_modal.dart';

class TeacherProfileView extends ConsumerWidget {
  const TeacherProfileView({super.key});

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

    final fullName = user?['fullName'] ?? 'Docente UECG';
    final email = user?['email'] ?? 'docente@uecg.edu.bo';
    final ci = user?['ci'] ?? 'No registrado';

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
              Text('NOMBRES Y APELLIDOS',
                  style: textTheme.labelSmall
                      ?.copyWith(color: AppTheme.slateGray)),
              Text(fullName,
                  style: textTheme.bodyLarge?.copyWith(
                      color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Text('DOCUMENTO DE IDENTIDAD',
                  style: textTheme.labelSmall
                      ?.copyWith(color: AppTheme.slateGray)),
              Text(ci,
                  style: textTheme.bodyLarge?.copyWith(
                      color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Text('CORREO INSTITUCIONAL',
                  style: textTheme.labelSmall
                      ?.copyWith(color: AppTheme.slateGray)),
              Text(email,
                  style: textTheme.bodyLarge?.copyWith(
                      color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
            ],
          ),
          actionText: 'SOLICITAR ACTUALIZACIÓN',
          onAction: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                    'Comuníquese con administración para cambiar sus datos.'),
                backgroundColor: AppTheme.inkBlack,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              ),
            );
          },
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
                  color: AppTheme.swissBlue.withOpacity(0.1),
                  child: const Icon(Icons.qr_code_scanner,
                      color: AppTheme.swissBlue, size: 20),
                ),
                title: Text('VINCULAR A WEB CON QR',
                    style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.inkBlack)),
                subtitle: const Text('Iniciar sesión en la computadora del aula',
                    style: TextStyle(fontSize: 10, color: AppTheme.slateGray)),
                trailing: const Icon(Icons.arrow_forward_ios,
                    size: 14, color: AppTheme.slateGray),
                onTap: () => context.push('/scanner/web-login'),
              ),
              const Divider(height: 16),
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