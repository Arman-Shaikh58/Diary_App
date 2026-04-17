import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/diary_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/diary_editor_screen.dart';
import 'screens/image_viewer_screen.dart';
import 'services/api_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize API service singleton
  ApiService();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: AppColors.background,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DiaryProvider()),
      ],
      child: const MyDiaryApp(),
    ),
  );
}

class MyDiaryApp extends StatelessWidget {
  const MyDiaryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Diary',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: '/splash',
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/splash':
            return _fadeRoute(const SplashScreen(), settings);
          case '/login':
            return _fadeRoute(const LoginScreen(), settings);
          case '/register':
            return _fadeRoute(const RegisterScreen(), settings);
          case '/home':
            return _fadeRoute(const HomeScreen(), settings);
          case '/editor':
            final date = settings.arguments as String;
            return _slideRoute(
              DiaryEditorScreen(date: date),
              settings,
            );
          case '/image-viewer':
            final args = settings.arguments as Map<String, dynamic>;
            return _fadeRoute(
              ImageViewerScreen(
                images: List<Map<String, dynamic>>.from(args['images']),
                initialIndex: args['initialIndex'] as int,
              ),
              settings,
            );
          default:
            return _fadeRoute(const SplashScreen(), settings);
        }
      },
    );
  }

  /// Creates a fade transition route
  PageRouteBuilder _fadeRoute(Widget page, RouteSettings settings) {
    return PageRouteBuilder(
      settings: settings,
      pageBuilder: (_, __, ___) => page,
      transitionsBuilder: (_, animation, __, child) {
        return FadeTransition(opacity: animation, child: child);
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }

  /// Creates a slide-up transition route
  PageRouteBuilder _slideRoute(Widget page, RouteSettings settings) {
    return PageRouteBuilder(
      settings: settings,
      pageBuilder: (_, __, ___) => page,
      transitionsBuilder: (_, animation, __, child) {
        final tween = Tween<Offset>(
          begin: const Offset(0, 0.15),
          end: Offset.zero,
        ).chain(CurveTween(curve: Curves.easeOutCubic));

        return SlideTransition(
          position: animation.drive(tween),
          child: FadeTransition(opacity: animation, child: child),
        );
      },
      transitionDuration: const Duration(milliseconds: 350),
    );
  }
}
