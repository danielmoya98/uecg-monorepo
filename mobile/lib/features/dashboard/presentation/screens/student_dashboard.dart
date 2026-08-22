import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/swiss_bottom_nav_bar.dart';
// Importamos las vistas extraídas
import '../views/student/student_home_view.dart';
import '../views/student/student_grades_view.dart';
import '../views/student/student_schedule_view.dart';
import '../views/student/student_profile_view.dart';

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  int _currentIndex = 0;

  // ¡La lista ahora solo instancia las clases const!
  final List<Widget> _views = const [
    StudentHomeView(),
    StudentGradesView(),
    StudentScheduleView(),
    StudentProfileView(),
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        title: Text('PANEL ESTUDIANTIL', style: textTheme.labelSmall),
        centerTitle: false,
        bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _views,
      ),
      bottomNavigationBar: SwissBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: [
          SwissNavBarItem(icon: Icons.home_outlined, label: 'INICIO'),
          SwissNavBarItem(icon: Icons.analytics_outlined, label: 'NOTAS'),
          SwissNavBarItem(icon: Icons.calendar_today_outlined, label: 'HORARIO'),
          SwissNavBarItem(icon: Icons.person_outline, label: 'PERFIL'),
        ],
      ),
    );
  }
}