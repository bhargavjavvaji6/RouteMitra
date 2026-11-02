import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'firebase_options.dart';
import 'screens/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  var firebaseReady = false;
  try {
    await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    firebaseReady = true;
  } catch (e) {
    debugPrint('Firebase initialization failed: $e');
  }
  runApp(RouteMitraApp(firebaseReady: firebaseReady));
}

class RouteMitraApp extends StatelessWidget {
  const RouteMitraApp({super.key, required this.firebaseReady});
  final bool firebaseReady;
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'RouteMitra',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(useMaterial3: true, colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF176B87))),
    home: SplashScreen(firebaseReady: firebaseReady),
  );
}
