import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/app_theme.dart';

class TripCompletionScreen extends StatefulWidget {
  const TripCompletionScreen({super.key});

  @override
  State<TripCompletionScreen> createState() => _TripCompletionScreenState();
}

class _TripCompletionScreenState extends State<TripCompletionScreen> {
  int _selectedRating = 0;
  final List<String> _emojis = ['😟', '😕', '😐', '🙂', '😄'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 40),

              // ── Celebration icon ──
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primary, AppTheme.mint],
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.mint.withValues(alpha: 0.3),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.check_rounded,
                  color: Colors.white,
                  size: 52,
                ),
              )
                  .animate()
                  .scale(
                    begin: const Offset(0.5, 0.5),
                    end: const Offset(1.0, 1.0),
                    duration: 600.ms,
                    curve: Curves.elasticOut,
                  )
                  .fadeIn(duration: 400.ms),

              const SizedBox(height: 28),

              // ── Title ──
              const Text(
                'All Members Reached!',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ).animate(delay: 300.ms).fadeIn(duration: 500.ms),

              const SizedBox(height: 8),

              Text(
                'Your trip has been completed\nsuccessfully.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: Colors.white.withValues(alpha: 0.6),
                  height: 1.5,
                ),
              ).animate(delay: 400.ms).fadeIn(duration: 500.ms),

              const SizedBox(height: 36),

              // ── Trip stats ──
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.darkCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF2D3D4F)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _statItem('3/3', 'Members arrived'),
                        Container(
                          width: 1,
                          height: 40,
                          color: const Color(0xFF2D3D4F),
                        ),
                        _statItem('5h 18m', 'Total time'),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Container(
                      height: 1,
                      color: const Color(0xFF2D3D4F),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.straighten_rounded,
                          color: AppTheme.mint,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Distance',
                          style: TextStyle(
                            color: Colors.white54,
                            fontSize: 13,
                          ),
                        ),
                        const Spacer(),
                        const Text(
                          '368 km',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ).animate(delay: 500.ms).fadeIn(duration: 500.ms).slideY(
                    begin: 0.2,
                    end: 0,
                    duration: 500.ms,
                  ),

              const SizedBox(height: 30),

              // ── Feedback section ──
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.darkCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF2D3D4F)),
                ),
                child: Column(
                  children: [
                    Text(
                      'How was your trip? (Optional)',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ── Emoji rating ──
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: List.generate(5, (index) {
                        final selected = _selectedRating == index + 1;
                        return GestureDetector(
                          onTap: () {
                            setState(() => _selectedRating = index + 1);
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: selected
                                  ? AppTheme.primary.withValues(alpha: 0.2)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: selected
                                    ? AppTheme.mint
                                    : const Color(0xFF2D3D4F),
                                width: selected ? 2 : 1,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                _emojis[index],
                                style: TextStyle(
                                  fontSize: selected ? 28 : 24,
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ),

                    if (_selectedRating > 0) ...[
                      const SizedBox(height: 16),
                      Text(
                        [
                          '',
                          'We\'ll do better!',
                          'Thanks for the feedback',
                          'Not bad!',
                          'Glad you enjoyed it!',
                          'Awesome! 🎉'
                        ][_selectedRating],
                        style: TextStyle(
                          color: AppTheme.mint.withValues(alpha: 0.8),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ],
                ),
              ).animate(delay: 600.ms).fadeIn(duration: 500.ms),

              const SizedBox(height: 36),

              // ── Close Trip button ──
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Close Trip',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ).animate(delay: 700.ms).fadeIn(duration: 400.ms),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w900,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withValues(alpha: 0.5),
          ),
        ),
      ],
    );
  }
}
