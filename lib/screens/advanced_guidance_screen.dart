import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/app_theme.dart';

class AdvancedGuidanceScreen extends StatefulWidget {
  const AdvancedGuidanceScreen({super.key});

  @override
  State<AdvancedGuidanceScreen> createState() => _AdvancedGuidanceScreenState();
}

class _AdvancedGuidanceScreenState extends State<AdvancedGuidanceScreen> {
  int _currentSpeed = 60;
  late Timer _speedTimer;

  final List<_GuidanceStep> _steps = [
    _GuidanceStep(
      distance: '300 m',
      instruction: 'Keep left and take the service road under the flyover',
      icon: Icons.arrow_downward_rounded,
      type: 'under',
    ),
    _GuidanceStep(
      distance: '1.2 km',
      instruction: 'Go under the flyover and take left',
      icon: Icons.turn_left_rounded,
      type: 'under',
    ),
    _GuidanceStep(
      distance: '3.5 km',
      instruction: 'Take the ramp to merge onto NH16',
      icon: Icons.merge_rounded,
      type: 'merge',
    ),
  ];

  int _currentStepIndex = 0;

  @override
  void initState() {
    super.initState();
    _speedTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted) {
        setState(() {
          _currentSpeed = 50 + Random().nextInt(30);
        });
      }
    });
  }

  @override
  void dispose() {
    _speedTimer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentStep = _steps[_currentStepIndex];

    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: Stack(
        children: [
          // ── Map background ──
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  const Color(0xFF1A2E3E),
                  const Color(0xFF0D2137),
                  AppTheme.darkBg.withValues(alpha: 0.95),
                ],
              ),
            ),
            child: CustomPaint(
              size: MediaQuery.of(context).size,
              painter: _FlyoverMapPainter(),
            ),
          ),

          // ── Top guidance card ──
          SafeArea(
            child: Column(
              children: [
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primary.withValues(alpha: 0.4),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              currentStep.icon,
                              color: Colors.white,
                              size: 26,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  currentStep.distance,
                                  style: const TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                  ),
                                ),
                                Text(
                                  currentStep.instruction,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color:
                                        Colors.white.withValues(alpha: 0.85),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      // ── Flyover visual ──
                      if (currentStep.type == 'under') ...[
                        const SizedBox(height: 16),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.layers_rounded,
                                color: Colors.white.withValues(alpha: 0.7),
                                size: 20,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'Under/Over Flyover Instructions',
                                  style: TextStyle(
                                    color:
                                        Colors.white.withValues(alpha: 0.7),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: AppTheme.mint.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'UNDER',
                                  style: TextStyle(
                                    color: AppTheme.mint,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ).animate().slideY(begin: -0.5, end: 0, duration: 500.ms).fadeIn(),

                // ── Next steps preview ──
                if (_currentStepIndex < _steps.length - 1)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.darkCard.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF2D3D4F)),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _steps[_currentStepIndex + 1].icon,
                          color: Colors.white54,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Then: ${_steps[_currentStepIndex + 1].instruction}',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ).animate(delay: 300.ms).fadeIn(duration: 400.ms),
              ],
            ),
          ),

          // ── Speed indicator ──
          Positioned(
            bottom: 180,
            left: 20,
            child: Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.darkCard,
                border: Border.all(color: AppTheme.primary, width: 3),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.3),
                    blurRadius: 14,
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '$_currentSpeed',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    'km/h',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 9,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Bottom panel ──
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          '5h 02m',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '362 km  •  4:43 PM',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.white.withValues(alpha: 0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(80, 44),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(22),
                      ),
                    ),
                    child: const Text(
                      'End',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Back button ──
          Positioned(
            bottom: 100,
            right: 20,
            child: FloatingActionButton.small(
              onPressed: () {
                if (_currentStepIndex < _steps.length - 1) {
                  setState(() => _currentStepIndex++);
                }
              },
              backgroundColor: AppTheme.darkSurface,
              child: const Icon(Icons.skip_next_rounded, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

class _GuidanceStep {
  final String distance;
  final String instruction;
  final IconData icon;
  final String type;

  _GuidanceStep({
    required this.distance,
    required this.instruction,
    required this.icon,
    required this.type,
  });
}

class _FlyoverMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Draw road grid
    final gridPaint = Paint()
      ..color = const Color(0xFF1E3A4E).withValues(alpha: 0.25)
      ..strokeWidth = 2;

    for (var i = 0; i < 10; i++) {
      canvas.drawLine(
        Offset(0, size.height * i / 10),
        Offset(size.width, size.height * i / 10),
        gridPaint,
      );
      canvas.drawLine(
        Offset(size.width * i / 10, 0),
        Offset(size.width * i / 10, size.height),
        gridPaint,
      );
    }

    // Draw flyover (thick road)
    final flyoverPaint = Paint()
      ..color = const Color(0xFF3A5A6E).withValues(alpha: 0.6)
      ..strokeWidth = 30
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(
      Offset(0, size.height * 0.4),
      Offset(size.width, size.height * 0.4),
      flyoverPaint,
    );

    // Draw main route (under flyover)
    final routePaint = Paint()
      ..color = AppTheme.primary
      ..strokeWidth = 5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path()
      ..moveTo(size.width * 0.5, size.height)
      ..lineTo(size.width * 0.5, size.height * 0.4)
      ..cubicTo(
        size.width * 0.5,
        size.height * 0.35,
        size.width * 0.4,
        size.height * 0.3,
        size.width * 0.3,
        size.height * 0.3,
      )
      ..lineTo(size.width * 0.1, size.height * 0.15);

    canvas.drawPath(path, routePaint);

    // Current position
    final posPaint = Paint()
      ..color = AppTheme.mint
      ..style = PaintingStyle.fill;

    canvas.drawCircle(
      Offset(size.width * 0.5, size.height * 0.55),
      7,
      posPaint,
    );

    canvas.drawCircle(
      Offset(size.width * 0.5, size.height * 0.55),
      16,
      posPaint..color = AppTheme.mint.withValues(alpha: 0.25),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
