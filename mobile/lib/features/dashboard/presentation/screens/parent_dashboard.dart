import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/swiss_bottom_nav_bar.dart';

// Importamos las vistas extraídas
import '../views/parent/parent_home_view.dart';
import '../views/parent/parent_grades_view.dart';
import '../views/parent/parent_messages_view.dart';
import '../views/parent/parent_profile_view.dart';

class ParentDashboard extends StatefulWidget {
  const ParentDashboard({super.key});

  @override
  State<ParentDashboard> createState() => _ParentDashboardState();
}

class _ParentDashboardState extends State<ParentDashboard> {
  int _currentIndex = 0;

  final List<Widget> _views = const [
    ParentHomeView(),
    ParentGradesView(),
    ParentMessagesView(),
    ParentProfileView(),
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.pureWhite,
        elevation: 0,
        title: Text('PANEL TUTOR', style: textTheme.labelSmall),
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
          SwissNavBarItem(icon: Icons.chat_bubble_outline, label: 'MENSAJES'),
          SwissNavBarItem(icon: Icons.person_outline, label: 'PERFIL'),
        ],
      ),
    );
  }
}