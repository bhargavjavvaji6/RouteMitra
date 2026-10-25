import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/app_theme.dart';
import 'live_navigation_screen.dart';

class StartTripScreen extends StatefulWidget {
  const StartTripScreen({super.key, this.isPlanned = false});

  final bool isPlanned;

  @override
  State<StartTripScreen> createState() => _StartTripScreenState();
}

class _StartTripScreenState extends State<StartTripScreen> {
  final _destinationController = TextEditingController();
  int _selectedPeople = 3;
  final String _tripType = 'friends'; // 'friends' or 'family'
  String _quickDest = ''; // 'home', 'office', 'nearby'
  bool _showFuelStations = false;
  bool _showEvCharging = false;
  bool _showRestaurants = false;

  @override
  void dispose() {
    _destinationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        backgroundColor: AppTheme.darkBg,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.isPlanned ? 'Planned Trip' : 'Quick Trip',
          style: const TextStyle(
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Trip type ──
            Text(
              widget.isPlanned
                  ? 'Plan your long journey'
                  : 'Going out with friends or family?',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withValues(alpha: 0.7),
              ),
            ).animate().fadeIn(duration: 400.ms),

            const SizedBox(height: 24),

            // ── How many people? ──
            const Text(
              'How many people?',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: List.generate(6, (i) {
                final count = i + 1;
                final label = count == 6 ? '6+' : '$count';
                final selected = _selectedPeople == count;
                return Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedPeople = count),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: selected
                            ? AppTheme.primary
                            : AppTheme.darkSurface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selected
                              ? AppTheme.mint
                              : const Color(0xFF2D3D4F),
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          label,
                          style: TextStyle(
                            color: selected ? Colors.white : Colors.white70,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ).animate().fadeIn(duration: 400.ms, delay: 100.ms),

            const SizedBox(height: 28),

            // ── Where are you going? ──
            const Text(
              '↳ Where are you going?',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),

            // ── Search destination ──
            Container(
              decoration: BoxDecoration(
                color: AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF2D3D4F)),
              ),
              child: TextField(
                controller: _destinationController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  prefixIcon: Icon(
                    Icons.search,
                    color: Colors.white.withValues(alpha: 0.5),
                  ),
                  hintText: 'Search destination...',
                  hintStyle: TextStyle(
                    color: Colors.white.withValues(alpha: 0.4),
                  ),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                ),
              ),
            ).animate().fadeIn(duration: 400.ms, delay: 200.ms),

            const SizedBox(height: 16),

            // ── Quick destinations ──
            Row(
              children: [
                _quickDestChip('Home', Icons.home_rounded, 'home'),
                const SizedBox(width: 10),
                _quickDestChip('Office', Icons.work_rounded, 'office'),
                const SizedBox(width: 10),
                _quickDestChip('Nearby', Icons.near_me_rounded, 'nearby'),
              ],
            ).animate().fadeIn(duration: 400.ms, delay: 300.ms),

            const SizedBox(height: 28),

            // ── How many people (again for planned) ──
            if (widget.isPlanned) ...[
              const Text(
                'How many people?',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: List.generate(6, (i) {
                  final count = i + 1;
                  final label = count == 6 ? '6+' : '$count';
                  final selected = _selectedPeople == count;
                  return Padding(
                    padding: const EdgeInsets.only(right: 10),
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedPeople = count),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: selected
                              ? AppTheme.primary
                              : AppTheme.darkSurface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: selected
                                ? AppTheme.mint
                                : const Color(0xFF2D3D4F),
                            width: selected ? 2 : 1,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            label,
                            style: TextStyle(
                              color: selected ? Colors.white : Colors.white70,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 28),
            ],

            // ── Optional features ──
            const Text(
              'Optional',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),

            _optionalToggle(
              'Show fuel stations',
              Icons.local_gas_station_rounded,
              _showFuelStations,
              (v) => setState(() => _showFuelStations = v),
            ),
            _optionalToggle(
              'Show EV charging',
              Icons.ev_station_rounded,
              _showEvCharging,
              (v) => setState(() => _showEvCharging = v),
            ),
            _optionalToggle(
              'Show restaurants',
              Icons.restaurant_rounded,
              _showRestaurants,
              (v) => setState(() => _showRestaurants = v),
            ),

            const SizedBox(height: 36),

            // ── Start Navigation button ──
            SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const LiveNavigationScreen(),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    icon: const Icon(
                      Icons.navigation_rounded,
                      color: Colors.white,
                    ),
                    label: const Text(
                      'Start Navigation',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                )
                .animate()
                .fadeIn(duration: 400.ms, delay: 500.ms)
                .slideY(begin: 0.2, end: 0, duration: 400.ms),
          ],
        ),
      ),
    );
  }

  Widget _quickDestChip(String label, IconData icon, String key) {
    final selected = _quickDest == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _quickDest = key),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected
                ? AppTheme.primary.withValues(alpha: 0.2)
                : AppTheme.darkSurface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? AppTheme.mint : const Color(0xFF2D3D4F),
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: selected ? AppTheme.mint : Colors.white54,
                size: 22,
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  color: selected ? AppTheme.mint : Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _optionalToggle(
    String label,
    IconData icon,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: AppTheme.darkSurface,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppTheme.mint, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.8),
                  fontSize: 14,
                ),
              ),
            ),
            Switch(
              value: value,
              onChanged: onChanged,
              activeThumbColor: AppTheme.mint,
            ),
          ],
        ),
      ),
    );
  }
}
