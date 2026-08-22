import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../../../../core/widgets/swiss_header.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';

class ParentHomeView extends ConsumerWidget {
  const ParentHomeView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textTheme = Theme.of(context).textTheme;

    // Leemos la memoria global de Riverpod
    final user = ref.watch(authProvider).user;

    // Extracción segura
    final firstName = user?['firstName'] ?? 'TUTOR';
    final students = user?['students'] as List<dynamic>? ?? [];

    // Primer hijo para el selector rápido
    final firstStudentName = students.isNotEmpty ? students[0]['firstName'] : 'S/A';

    return RefreshIndicator(
      color: AppTheme.pureWhite,
      backgroundColor: AppTheme.swissBlue,
      onRefresh: () async {
        // Dispara la recarga de datos al tirar hacia abajo
        await ref.read(authProvider.notifier).refreshProfile();
      },
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(), // Necesario para RefreshIndicator
        padding: const EdgeInsets.all(24.0),
        children: [
          SwissHeader(
            greeting: 'BUENOS DÍAS 👋',
            title: firstName.toString().toUpperCase(),
            trailing: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(border: Border.all(color: AppTheme.swissBlue)),
              child: Text('$firstStudentName ▼'.toUpperCase(), style: textTheme.labelSmall),
            ),
          ),
          const SizedBox(height: 24),

          // Dibujo dinámico de los hijos
          if (students.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(border: Border.all(color: AppTheme.lineGray)),
              child: Text(
                'Aún no tiene estudiantes vinculados a su perfil. Acérquese a secretaría.',
                style: textTheme.bodyLarge?.copyWith(color: AppTheme.slateGray),
              ),
            )
          else
          // Pintamos una SwissCard por cada estudiante en el JSON
            ...students.map((student) => _buildDynamicStudentCard(student, textTheme)).toList(),

          const SizedBox(height: 24),

          SwissCard(
            label: 'ASISTENCIA RECIENTE',
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Sin novedades el día de hoy.', style: textTheme.bodyLarge?.copyWith(color: AppTheme.slateGray)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDynamicStudentCard(dynamic student, TextTheme textTheme) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: SwissCard(
        label: 'RENDIMIENTO ACADÉMICO (${student['firstName'].toString().toUpperCase()})',
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('CURSO: ${student['course'] ?? 'S/A'}', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
            const SizedBox(height: 16),
            Text('PROMEDIO ACTUAL', style: textTheme.labelSmall?.copyWith(color: AppTheme.slateGray)),
            Text('S/N', style: textTheme.displayLarge?.copyWith(color: AppTheme.swissBlue)),
          ],
        ),
        actionText: 'VER NOTAS COMPLETAS',
        onAction: () {},
      ),
    );
  }
}