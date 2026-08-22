import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../../../../core/widgets/swiss_header.dart';

class ParentProfileView extends StatelessWidget {
  const ParentProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        const SwissHeader(greeting: 'TUTOR', title: 'MI PERFIL'),
        const SizedBox(height: 24),

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
                      Text('Juan Pérez', style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.inkBlack)),
                      Text('3ro de Secundaria "A"', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
                    ],
                  ),
                  const Icon(Icons.check_circle, color: AppTheme.swissBlue), // Seleccionado actualmente
                ],
              ),
              const Divider(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Ana Pérez', style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.inkBlack)),
                      Text('6to de Primaria "B"', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
                    ],
                  ),
                  const Icon(Icons.circle_outlined, color: AppTheme.lineGray),
                ],
              ),
            ],
          ),
          actionText: 'AÑADIR OTRO ESTUDIANTE',
          onAction: () {}, // Lógica para vincular por código
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
      ],
    );
  }
}