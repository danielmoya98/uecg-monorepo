import 'package:flutter/material.dart';
import '../../../../../core/theme/app_theme.dart';

class ParentMessagesView extends StatelessWidget {
  const ParentMessagesView({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        Text('BANDEJA DE ENTRADA', style: textTheme.labelSmall),
        const SizedBox(height: 24),

        // Mensaje del Docente
        Container(
          margin: const EdgeInsets.only(bottom: 16.0),
          padding: const EdgeInsets.all(24.0),
          decoration: BoxDecoration(
            border: Border.all(color: AppTheme.swissBlue, width: 2), // Destacado
            color: AppTheme.swissBlue.withOpacity(0.02),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('PROF. CARLOS (MATEMÁTICA)', style: textTheme.labelSmall?.copyWith(color: AppTheme.swissBlue)),
                  Text('HOY', style: textTheme.labelSmall),
                ],
              ),
              const SizedBox(height: 16),
              Text('Bajo rendimiento en el último parcial', style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.inkBlack)),
              const SizedBox(height: 8),
              Text('Estimada madre de familia, le escribo para solicitar una reunión debido al desempeño de Juan en la última evaluación...', style: textTheme.bodyLarge),
            ],
          ),
        ),

        // Circular de Dirección
        Container(
          margin: const EdgeInsets.only(bottom: 16.0),
          padding: const EdgeInsets.all(24.0),
          decoration: BoxDecoration(border: Border.all(color: AppTheme.lineGray, width: 1)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('DIRECCIÓN GENERAL', style: textTheme.labelSmall),
                  Text('10 MAR', style: textTheme.labelSmall),
                ],
              ),
              const SizedBox(height: 16),
              Text('Reunión general de padres de familia', style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.inkBlack)),
              const SizedBox(height: 8),
              Text('Se convoca a todos los tutores a la reunión informativa del primer trimestre este viernes a las 18:00 hrs en el coliseo.', style: textTheme.bodyLarge),
            ],
          ),
        ),
      ],
    );
  }
}