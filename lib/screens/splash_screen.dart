import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'login_screen.dart';
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key, required this.firebaseReady});
  final bool firebaseReady;
  @override State<SplashScreen> createState() => _SplashScreenState();
}
class _SplashScreenState extends State<SplashScreen> {
  @override void initState() { super.initState(); WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!mounted) return;
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => widget.firebaseReady ? const HomeScreen() : const LoginScreen(firebaseUnavailable: true)));
  }); }
  @override Widget build(BuildContext context) => const Scaffold(body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
    Icon(Icons.route_rounded, size: 72, color: Color(0xFF176B87)), SizedBox(height: 12),
    Text('RouteMitra', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)), SizedBox(height: 12), CircularProgressIndicator()
  ])));
}
