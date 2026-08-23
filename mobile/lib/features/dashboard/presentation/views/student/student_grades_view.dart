import 'package:flutter/material.dart';
import '../../../../../core/theme/app_theme.dart';

class StudentGradesView extends StatefulWidget {
  const StudentGradesView({super.key});

  @override
  State<StudentGradesView> createState() => _StudentGradesViewState();
}

class _StudentGradesViewState extends State<StudentGradesView> {
  int _selectedTrimesterIndex = 1; // 2do Trimestre por defecto

  final trimesters = [
    {'name': '1er Trimestre', 'status': 'CERRADO', 'isOpen': false},
    {'name': '2do Trimestre', 'status': 'ABIERTO', 'isOpen': true},
    {'name': '3er Trimestre', 'status': 'PENDIENTE', 'isOpen': false},
  ];

  // Calificaciones en escala boliviana Ley 070 (0 - 100 pts, Aprobación >= 51)
  final Map<int, List<Map<String, dynamic>>> gradesByTrimester = {
    0: [
      {'subject': 'Matemática', 'score': 75, 'ser': 9, 'saber': 32, 'hacer': 30, 'auto': 4},
      {'subject': 'Historia', 'score': 90, 'ser': 10, 'saber': 40, 'hacer': 35, 'auto': 5},
      {'subject': 'Lenguaje', 'score': 81, 'ser': 9, 'saber': 37, 'hacer': 30, 'auto': 5},
      {'subject': 'Física', 'score': 58, 'ser': 8, 'saber': 24, 'hacer': 22, 'auto': 4},
      {'subject': 'Química', 'score': 85, 'ser': 9, 'saber': 39, 'hacer': 32, 'auto': 5},
    ],
    1: [
      {'subject': 'Matemática', 'score': 50, 'ser': 7, 'saber': 21, 'hacer': 18, 'auto': 4}, // Reforzamiento (< 51)
      {'subject': 'Historia', 'score': 92, 'ser': 10, 'saber': 42, 'hacer': 35, 'auto': 5},
      {'subject': 'Lenguaje', 'score': 84, 'ser': 9, 'saber': 38, 'hacer': 32, 'auto': 5},
      {'subject': 'Física', 'score': 65, 'ser': 8, 'saber': 29, 'hacer': 24, 'auto': 4},
      {'subject': 'Química', 'score': 88, 'ser': 10, 'saber': 40, 'hacer': 33, 'auto': 5},
    ],
    2: [
      {'subject': 'Matemática', 'score': null},
      {'subject': 'Historia', 'score': null},
      {'subject': 'Lenguaje', 'score': null},
      {'subject': 'Física', 'score': null},
      {'subject': 'Química', 'score': null},
    ],
  };

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final currentTrimester = trimesters[_selectedTrimesterIndex];
    final currentGrades = gradesByTrimester[_selectedTrimesterIndex] ?? [];

    final validScores = currentGrades
        .where((g) => g['score'] != null)
        .map((g) => g['score'] as int)
        .toList();

    final average = validScores.isNotEmpty
        ? (validScores.reduce((a, b) => a + b) / validScores.length).toStringAsFixed(1)
        : '--';

    return ListView(
      padding: const EdgeInsets.all(24.0),
      children: [
        Text('BOLETÍN DE CALIFICACIONES', style: textTheme.labelSmall),
        const SizedBox(height: 16),

        // Selector de Trimestres
        Container(
          padding: const EdgeInsets.all(4.0),
          decoration: BoxDecoration(
            color: AppTheme.pureWhite,
            border: Border.all(color: AppTheme.lineGray, width: 1),
          ),
          child: Row(
            children: List.generate(trimesters.length, (index) {
              final trim = trimesters[index];
              final isSelected = _selectedTrimesterIndex == index;
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
                          trim['name'] as String,
                          textAlign: TextAlign.center,
                          style: textTheme.labelSmall?.copyWith(
                            color: isSelected ? AppTheme.pureWhite : AppTheme.inkBlack,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          trim['status'] as String,
                          style: TextStyle(
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            color: trim['isOpen'] == true
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
              Text('PROMEDIO DEL TRIMESTRE (${currentTrimester['name']})', style: textTheme.labelSmall),
              const SizedBox(height: 8),
              Text(
                average,
                style: textTheme.displayLarge?.copyWith(fontSize: 44, color: AppTheme.swissBlue, fontWeight: FontWeight.black),
              ),
              const SizedBox(height: 4),
              Text(
                'ESCALA LEY 070 (0 - 100 PTS • MÍNIMO 51 PTS)',
                style: textTheme.labelSmall?.copyWith(fontSize: 9, color: AppTheme.inkBlack.withOpacity(0.6)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        Text('DETALLE POR MATERIA', style: textTheme.labelSmall),
        const SizedBox(height: 12),

        ...currentGrades.map((item) {
          final score = item['score'] as int?;
          if (score == null) {
            return Container(
              margin: const EdgeInsets.only(bottom: 8.0),
              padding: const EdgeInsets.all(14.0),
              decoration: BoxDecoration(border: Border.all(color: AppTheme.lineGray, width: 1)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(item['subject'] as String, style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const Text('Sin calificar', style: TextStyle(fontSize: 11, color: Colors.grey, fontStyle: FontStyle.italic)),
                ],
              ),
            );
          }

          final isFailing = score < 51; // Reprobación / Reforzamiento en Ley 070

          return Container(
            margin: const EdgeInsets.only(bottom: 8.0),
            padding: const EdgeInsets.all(14.0),
            decoration: BoxDecoration(border: Border.all(color: isFailing ? Colors.red.shade300 : AppTheme.lineGray, width: 1)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item['subject'] as String, style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(
                      'Ser: ${item['ser']} • Saber: ${item['saber']} • Hacer: ${item['hacer']} • Auto: ${item['auto']}',
                      style: TextStyle(fontSize: 10, color: Colors.grey.shade700, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: isFailing ? Colors.red.shade50 : AppTheme.pureWhite,
                    border: Border.all(color: isFailing ? Colors.red.shade800 : AppTheme.lineGray, width: 1),
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
  }
}