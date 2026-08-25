import 'package:go_router/go_router.dart';
import '../../features/onboarding/presentation/screens/splash_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../../features/onboarding/presentation/screens/welcome_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/web_qr_scanner_screen.dart';
import '../../features/dashboard/presentation/screens/student_dashboard.dart';
import '../../features/dashboard/presentation/screens/parent_dashboard.dart';
import '../../features/dashboard/presentation/screens/teacher_dashboard.dart';
import '../../features/dashboard/presentation/screens/qr_attendance_screen.dart';
import '../../features/dashboard/presentation/screens/manual_attendance_screen.dart';
import '../../features/dashboard/presentation/screens/course_detail_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
      GoRoute(path: '/welcome', builder: (context, state) => const WelcomeScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => ForgotPasswordScreen(
          initialCode: state.uri.queryParameters['code'],
          initialIdentifier: state.uri.queryParameters['email'] ??
              state.uri.queryParameters['identifier'],
        ),
      ),

      GoRoute(path: '/dashboard/student', builder: (context, state) => const StudentDashboard()),
      GoRoute(path: '/dashboard/parent', builder: (context, state) => const ParentDashboard()),
      GoRoute(path: '/dashboard/teacher', builder: (context, state) => const TeacherDashboard()),
      GoRoute(
        path: '/attendance/qr',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return QRAttendanceScreen(
            classPeriodId: extra?['classPeriodId'] as String?,
            classPeriodIds: (extra?['classPeriodIds'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList(),
            courseTitle: extra?['courseTitle'] as String?,
          );
        },
      ),
      GoRoute(
        path: '/attendance/manual',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return ManualAttendanceScreen(
            classroomId: extra?['classroomId'] as String?,
            classPeriodId: extra?['classPeriodId'] as String?,
            classPeriodIds: (extra?['classPeriodIds'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList(),
            courseTitle: extra?['courseTitle'] as String?,
            date: extra?['date'] as String?,
          );
        },
      ),
      GoRoute(path: '/scanner/web-login', builder: (context, state) => const WebQrScannerScreen()),
      GoRoute(path: '/course-detail', builder: (context, state) => const CourseDetailScreen()),
    ],
  );
}