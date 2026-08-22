import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class ManualAttendanceScreen extends StatefulWidget {
  const ManualAttendanceScreen({super.key});

  @override
  State<ManualAttendanceScreen> createState() => _ManualAttendanceScreenState();
}

class _ManualAttendanceScreenState extends State<ManualAttendanceScreen> {
  // Simulación de estudiantes y sus estados: 'P' (Presente), 'F' (Falta), 'R' (Retraso)
  final Map<String, String> _students = {
    'Álvarez, Camila': 'P',
    'Condori, Luis': 'P',
    'López, Ana': 'F',
    'Pérez, Juan': 'R',
    'Quispe, Carlos': 'P',
  };

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.inkBlack),
        title: Text('MANUAL: MATEMÁTICA 3RO A', style: textTheme.labelSmall),
        bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
      ),
      body: ListView.separated(
        itemCount: _students.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          String name = _students.keys.elementAt(index);
          String status = _students[name]!;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(name, style: textTheme.bodyLarge?.copyWith(color: AppTheme.inkBlack, fontWeight: FontWeight.bold)),
                ),
                // Botones de estado estilo bloque suizo
                Row(
                  children: [
                    _buildStatusBlock('P', status == 'P', () => setState(() => _students[name] = 'P')),
                    const SizedBox(width: 8),
                    _buildStatusBlock('F', status == 'F', () => setState(() => _students[name] = 'F')),
                    const SizedBox(width: 8),
                    _buildStatusBlock('R', status == 'R', () => setState(() => _students[name] = 'R')),
                  ],
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(24.0),
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppTheme.lineGray, width: 1)),
        ),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.swissBlue,
            foregroundColor: AppTheme.pureWhite,
          ),
          onPressed: () {
            // Guardar en BD
            Navigator.pop(context);
          },
          child: const Text('GUARDAR REGISTRO'),
        ),
      ),
    );
  }

  Widget _buildStatusBlock(String label, bool isActive, VoidCallback onTap) {
    Color getActiveColor() {
      if (label == 'F') return Colors.red.shade800;
      if (label == 'R') return Colors.orange.shade800;
      return AppTheme.swissBlue;
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isActive ? getActiveColor() : AppTheme.pureWhite,
          border: Border.all(color: isActive ? getActiveColor() : AppTheme.lineGray, width: 1),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: isActive ? AppTheme.pureWhite : AppTheme.slateGray,
          ),
        ),
      ),
    );
  }
}