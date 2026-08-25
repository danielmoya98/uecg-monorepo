import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uecg_app/core/theme/app_theme.dart';
import 'package:uecg_app/features/dashboard/presentation/providers/grades_provider.dart';

class StudentGradesView extends ConsumerStatefulWidget {
  const StudentGradesView({super.key});

  @override
  ConsumerState<StudentGradesView> createState() => _StudentGradesViewState();
}

class _StudentGradesViewState extends ConsumerState<StudentGradesView> {
  int _selectedTrimesterIndex = 0;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final gradesState = ref.watch(studentGradesProvider);

    return RefreshIndicator(
      onRefresh: () => ref.read(studentGradesProvider.notifier).refresh(),
      child: gradesState.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.swissBlue),
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 12),
                Text(
                  'No se pudieron cargar las calificaciones',
                  style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(
                  error.toString().replaceAll('Exception: ', ''),
                  style: textTheme.bodySmall?.copyWith(color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.read(studentGradesProvider.notifier).refresh(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.inkBlack,
                    foregroundColor: AppTheme.pureWhite,
                  ),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ),
        ),
        data: (report) {
          if (report.trimesters.isEmpty) {
            return Center(
              child: Text('No hay trimestres configurados', style: textTheme.bodyMedium),
            );
          }

          final safeIndex = _selectedTrimesterIndex < report.trimesters.length
              ? _selectedTrimesterIndex
              : 0;
          final currentTrimester = report.trimesters[safeIndex];

          // Extraer las notas del trimestre seleccionado
          final List<int> validScores = [];
          for (final sub in report.subjects) {
            final grade = sub.trimesterGrades[currentTrimester.id];
            if (grade?.finalScore != null) {
              validScores.add(grade!.finalScore!);
            }
          }

          final average = validScores.isNotEmpty
              ? (validScores.reduce((a, b) => a + b) / validScores.length).toStringAsFixed(1)
              : '--';

          return ListView(
            padding: const EdgeInsets.all(24.0),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('BOLETÍN DE CALIFICACIONES', style: textTheme.labelSmall),
                  Flexible(
                    child: Text(
                      report.classroomLabel,
                      style: textTheme.labelSmall?.copyWith(color: AppTheme.swissBlue),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Selector de Trimestres Dinámico
              Container(
                padding: const EdgeInsets.all(4.0),
                decoration: BoxDecoration(
                  color: AppTheme.pureWhite,
                  border: Border.all(color: AppTheme.lineGray, width: 1),
                ),
                child: Row(
                  children: List.generate(report.trimesters.length, (index) {
                    final trim = report.trimesters[index];
                    final isSelected = safeIndex == index;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedTrimesterIndex = index),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? AppTheme.inkBlack : Colors.transparent,
                          ),
                          child: Column(
                            children: [
                              Text(
                                trim.displayName,
                                textAlign: TextAlign.center,
                                style: textTheme.labelSmall?.copyWith(
                                  color: isSelected ? AppTheme.pureWhite : AppTheme.inkBlack,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                trim.statusLabel,
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.w900,
                                  color: trim.isOpen
                                      ? (isSelected ? Colors.greenAccent : Colors.green.shade700)
                                      : (isSelected ? Colors.white60 : Colors.grey.shade600),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 20),

              // Promedio Global del Trimestre Seleccionado
              Container(
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  color: AppTheme.swissBlue.withOpacity(0.05),
                  border: Border.all(color: AppTheme.swissBlue, width: 2),
                ),
                child: Column(
                  children: [
                    Text('PROMEDIO DEL TRIMESTRE (${currentTrimester.displayName.toUpperCase()})',
                        style: textTheme.labelSmall),
                    const SizedBox(height: 8),
                    Text(
                      average,
                      style: textTheme.displayLarge?.copyWith(
                          fontSize: 44,
                          color: AppTheme.swissBlue,
                          fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'ESCALA LEY 070 (0 - 100 PTS • MÍNIMO 51 PTS)',
                      style: textTheme.labelSmall?.copyWith(
                          fontSize: 9, color: AppTheme.inkBlack.withOpacity(0.6)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              Text('DETALLE POR MATERIA', style: textTheme.labelSmall),
              const SizedBox(height: 12),

              if (report.subjects.isEmpty)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(border: Border.all(color: AppTheme.lineGray)),
                  child: const Center(child: Text('No hay materias registradas en este curso')),
                ),

              ...report.subjects.map((sub) {
                final grade = sub.trimesterGrades[currentTrimester.id];
                final score = grade?.finalScore;

                if (score == null) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8.0),
                    padding: const EdgeInsets.all(14.0),
                    decoration:
                        BoxDecoration(border: Border.all(color: AppTheme.lineGray, width: 1)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(sub.subjectName,
                                style: textTheme.bodyMedium
                                    ?.copyWith(fontWeight: FontWeight.bold)),
                            Text('Prof. ${sub.teacherName}',
                                style: TextStyle(
                                    fontSize: 10, color: Colors.grey.shade600)),
                          ],
                        ),
                        const Text('Sin calificar',
                            style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey,
                                fontStyle: FontStyle.italic)),
                      ],
                    ),
                  );
                }

                final isFailing = score < 51; // Reprobación / Reforzamiento Ley 070

                return Container(
                  margin: const EdgeInsets.only(bottom: 8.0),
                  padding: const EdgeInsets.all(14.0),
                  decoration: BoxDecoration(
                    border: Border.all(
                        color: isFailing ? Colors.red.shade300 : AppTheme.lineGray,
                        width: 1),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(sub.subjectName,
                                style: textTheme.bodyLarge
                                    ?.copyWith(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 2),
                            Text(
                              'Ser: ${grade?.scoreSer ?? '-'} • Saber: ${grade?.scoreSaber ?? '-'} • Hacer: ${grade?.scoreHacer ?? '-'} • Auto: ${grade?.scoreAuto ?? '-'}',
                              style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.grey.shade700,
                                  fontWeight: FontWeight.w500),
                            ),
                            if (grade?.recoveryScore != null)
                              Text(
                                'Reforzamiento: ${grade?.recoveryScore} pts',
                                style: const TextStyle(
                                    fontSize: 10,
                                    color: Colors.amber,
                                    fontWeight: FontWeight.bold),
                              ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isFailing ? Colors.red.shade50 : AppTheme.pureWhite,
                          border: Border.all(
                              color: isFailing ? Colors.red.shade800 : AppTheme.lineGray,
                              width: 1),
                        ),
                        child: Text(
                          score.toString(),
                          style: textTheme.bodyLarge?.copyWith(
                            color: isFailing ? Colors.red.shade800 : AppTheme.inkBlack,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}