import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({super.key});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  // Datos simulados de estudiantes y sus notas actuales
  final List<Map<String, dynamic>> _students = [
    {'name': 'Álvarez, Camila', 'grade': '8.5'},
    {'name': 'Condori, Luis', 'grade': '7.0'},
    {'name': 'López, Ana', 'grade': '5.8'},
    {'name': 'Pérez, Juan', 'grade': '9.2'},
    {'name': 'Quispe, Carlos', 'grade': ''}, // Sin calificar
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.inkBlack),
        title: Text('MATEMÁTICA - 3RO A', style: textTheme.labelSmall),
        bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cabecera de información del curso
          Container(
            padding: const EdgeInsets.all(24.0),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppTheme.lineGray, width: 1)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('PROMEDIO GENERAL', style: textTheme.labelSmall),
                    const SizedBox(height: 8),
                    Text('7.6 / 10', style: textTheme.displayLarge?.copyWith(fontSize: 28, color: AppTheme.swissBlue)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('ESTUDIANTES', style: textTheme.labelSmall),
                    const SizedBox(height: 8),
                    Text('30', style: textTheme.displayLarge?.copyWith(fontSize: 28)),
                  ],
                ),
              ],
            ),
          ),

          // Encabezado de la lista
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('NÓMINA', style: textTheme.labelSmall),
                Text('CALIFICACIÓN', style: textTheme.labelSmall),
              ],
            ),
          ),
          const Divider(height: 1),

          // Lista de Estudiantes con Input de Notas
          Expanded(
            child: ListView.separated(
              itemCount: _students.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final student = _students[index];
                // Color rojo si está aplazado (menor a 6.0)
                final isFailing = student['grade'] != '' && double.tryParse(student['grade']) != null && double.parse(student['grade']) < 6.0;

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(student['name'], style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
                      ),
                      // Input de calificación estilo Swiss
                      SizedBox(
                        width: 70,
                        child: TextFormField(
                          initialValue: student['grade'],
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          textAlign: TextAlign.center,
                          style: textTheme.bodyLarge?.copyWith(
                            color: isFailing ? Colors.red.shade800 : AppTheme.inkBlack,
                            fontWeight: FontWeight.bold,
                          ),
                          decoration: const InputDecoration(
                            contentPadding: EdgeInsets.symmetric(vertical: 12),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.zero,
                              borderSide: BorderSide(color: AppTheme.lineGray, width: 1),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.zero,
                              borderSide: BorderSide(color: AppTheme.swissBlue, width: 2),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
      // Botón para guardar cambios
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(24.0),
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppTheme.lineGray, width: 1))),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.swissBlue, foregroundColor: AppTheme.pureWhite),
          onPressed: () => Navigator.pop(context),
          child: const Text('GUARDAR CALIFICACIONES'),
        ),
      ),
    );
  }
}