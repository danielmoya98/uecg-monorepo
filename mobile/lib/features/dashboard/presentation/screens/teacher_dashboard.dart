import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/swiss_bottom_nav_bar.dart';

// Importamos las vistas extraídas
import '../views/teacher/teacher_home_view.dart';
import '../views/teacher/teacher_courses_view.dart';
import '../views/teacher/teacher_attendance_view.dart';
import '../views/teacher/teacher_profile_view.dart';

class TeacherDashboard extends StatefulWidget {
  const TeacherDashboard({super.key});

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> {
  int _currentIndex = 0;

  // Arreglo constante de las vistas refactorizadas
  final List<Widget> _views = const [
    TeacherHomeView(),
    TeacherCoursesView(),
    TeacherAttendanceView(),
    TeacherProfileView(),
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        title: Text('PANEL DOCENTE', style: textTheme.labelSmall),
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
          SwissNavBarItem(icon: Icons.book_outlined, label: 'CURSOS'),
          SwissNavBarItem(icon: Icons.fact_check_outlined, label: 'ASISTENCIA'),
          SwissNavBarItem(icon: Icons.person_outline, label: 'PERFIL'),
        ],
      ),
    );
  }
}