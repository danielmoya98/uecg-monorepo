import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';

class TeacherAttendanceView extends StatelessWidget {
  const TeacherAttendanceView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        Text('SELECCIONE EL CURSO', style: textTheme.labelSmall),
        const SizedBox(height: 24),
        SwissCard(
          label: '08:00 - MATEMÁTICA (3RO A)',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ElevatedButton.icon(
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('ESCANEAR CARNETS (QR)'),
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.swissBlue, foregroundColor: AppTheme.pureWhite),
                onPressed: () => context.push('/attendance/qr'),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.list_alt),
                label: const Text('REGISTRO MANUAL'),
                style: OutlinedButton.styleFrom(foregroundColor: AppTheme.slateGray, shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero), side: const BorderSide(color: AppTheme.lineGray)),
                onPressed: () => context.push('/attendance/manual'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SwissCard(
          label: '09:30 - MATEMÁTICA (4TO B)',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ElevatedButton.icon(
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('ESCANEAR CARNETS (QR)'),
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.swissBlue, foregroundColor: AppTheme.pureWhite),
                onPressed: () => context.push('/attendance/qr'),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.list_alt),
                label: const Text('REGISTRO MANUAL'),
                style: OutlinedButton.styleFrom(foregroundColor: AppTheme.slateGray, shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero), side: const BorderSide(color: AppTheme.lineGray)),
                onPressed: () => context.push('/attendance/manual'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}