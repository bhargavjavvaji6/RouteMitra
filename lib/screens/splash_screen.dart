import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/app_theme.dart';
import 'register_screen.dart';
import 'home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigate();
  }

  Future<void> _navigate() async {
    await Future.delayed(const Duration(milliseconds: 2800));

    if (!mounted) return;

    final prefs = await SharedPreferences.getInstance();
    final savedName = prefs.getString('user_name');
    final savedEmail = prefs.getString('user_email');
    final savedUserId = prefs.getString('user_id');

    final hasProfile =
        savedName != null &&
        savedName.trim().isNotEmpty &&
        savedEmail != null &&
        savedEmail.trim().isNotEmpty;

    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 600),
        pageBuilder: (_, __, ___) => hasProfile
            ? HomeScreen(
                userName: savedName,
                userEmail: savedEmail,
                userId: savedUserId ?? 'RM-DEMO',
              )
            : const RegisterScreen(),
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Logo ──
            Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppTheme.primary, AppTheme.mint],
                    ),
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.mint.withValues(alpha: 0.3),
                        blurRadius: 40,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.route_rounded,
                    color: Colors.white,
                    size: 64,
                  ),
                )
                .animate()
                .scale(
                  begin: const Offset(0.5, 0.5),
                  end: const Offset(1.0, 1.0),
                  duration: 800.ms,
                  curve: Curves.elasticOut,
                )
                .fadeIn(duration: 400.ms),

            const SizedBox(height: 32),

            // ── App Name ──
            Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: 'Route',
                        style: TextStyle(
                          fontSize: 42,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: -1,
                          shadows: [
                            Shadow(
                              color: AppTheme.primary.withValues(alpha: 0.5),
                              blurRadius: 20,
                            ),
                          ],
                        ),
                      ),
                      TextSpan(
                        text: 'Mitra',
                        style: TextStyle(
                          fontSize: 42,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.mint,
                          letterSpacing: -1,
                          shadows: [
                            Shadow(
                              color: AppTheme.mint.withValues(alpha: 0.5),
                              blurRadius: 20,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )
                .animate(delay: 400.ms)
                .fadeIn(duration: 600.ms)
                .slideY(begin: 0.3, end: 0, duration: 600.ms),

            const SizedBox(height: 12),

            // ── Tagline ──
            Text(
                  'Travel Together. Reach Together.',
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.white.withValues(alpha: 0.6),
                    letterSpacing: 1.5,
                    fontWeight: FontWeight.w500,
                  ),
                )
                .animate(delay: 800.ms)
                .fadeIn(duration: 600.ms)
                .slideY(begin: 0.3, end: 0, duration: 600.ms),

            const SizedBox(height: 48),

            // ── App Icon Variations ──
            Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(
                    4,
                    (i) => Container(
                      width: 40,
                      height: 40,
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            [AppTheme.primary, AppTheme.mint],
                            [const Color(0xFF059669), const Color(0xFF34D399)],
                            [const Color(0xFF065F46), const Color(0xFF10B981)],
                            [const Color(0xFF047857), const Color(0xFF6EE7B7)],
                          ][i],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.route_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                  ),
                )
                .animate(delay: 1200.ms)
                .fadeIn(duration: 600.ms)
                .slideY(begin: 0.5, end: 0, duration: 600.ms),

            const SizedBox(height: 60),

            // ── Loading indicator ──
            SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: AppTheme.mint.withValues(alpha: 0.6),
              ),
            ).animate(delay: 1600.ms).fadeIn(duration: 500.ms),
          ],
        ),
      ),
    );
  }
}
