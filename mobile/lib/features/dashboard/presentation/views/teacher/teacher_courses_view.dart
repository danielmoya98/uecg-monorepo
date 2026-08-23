import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../../core/widgets/swiss_card.dart';
import '../../providers/teacher_courses_provider.dart';

class TeacherCoursesView extends ConsumerWidget {
  const TeacherCoursesView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textTheme = Theme.of(context).textTheme;
    final coursesState = ref.watch(teacherCoursesProvider);

    return RefreshIndicator(
      onRefresh: () => ref.read(teacherCoursesProvider.notifier).refresh(),
      color: AppTheme.swissBlue,
      child: coursesState.when(
        loading: () => const Center(
          child: CircularProgressIndicator(
            color: AppTheme.swissBlue,
          ),
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'No se pudieron cargar los cursos',
                  style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString().replaceAll('Exception: ', ''),
                  style: textTheme.bodyMedium?.copyWith(color: Colors.grey.shade600),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.swissBlue,
                    foregroundColor: AppTheme.pureWhite,
                  ),
                  onPressed: () => ref.read(teacherCoursesProvider.notifier).loadCourses(),
                  child: const Text('REINTENTAR'),
                ),
              ],
            ),
          ),
        ),
        data: (courses) {
          if (courses.isEmpty) {
            return ListView(
              padding: const EdgeInsets.all(24.0),
              children: [
                Text('CURSOS ASIGNADOS', style: textTheme.labelSmall),
                const SizedBox(height: 48),
                Center(
                  child: Column(
                    children: [
                      Icon(Icons.inbox_outlined, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      Text(
                        'No tienes cursos o materias asignadas para esta gestión.',
                        style: textTheme.bodyMedium?.copyWith(color: Colors.grey.shade600),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(24.0),
            itemCount: courses.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 24.0),
                  child: Text('CURSOS ASIGNADOS', style: textTheme.labelSmall),
                );
              }

              final course = courses[index - 1];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: SwissCard(
                  label: course.displayName,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('ESTUDIANTES INSCRITOS', style: textTheme.bodyLarge),
                          Text(
                            '${course.enrolledCount} / ${course.capacity}',
                            style: textTheme.bodyLarge?.copyWith(
                              color: AppTheme.inkBlack,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('TURNO Y NIVEL', style: textTheme.bodyLarge),
                          Text(
                            '${course.shift} - ${course.level}',
                            style: textTheme.bodyLarge?.copyWith(
                              color: AppTheme.swissBlue,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      if (course.baseRoomName != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('AULA ASIGNADA', style: textTheme.bodyLarge),
                            Text(
                              course.baseRoomName!,
                              style: textTheme.bodyLarge?.copyWith(
                                color: AppTheme.inkBlack,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                  actionText: 'VER ESTUDIANTES Y NOTAS',
                  onAction: () => context.push('/course-detail'),
                ),
              );
            },
          );
        },
      ),
    );
  }
}