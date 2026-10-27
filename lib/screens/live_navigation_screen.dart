import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';

import '../core/app_theme.dart';
import 'members_list_screen.dart';
import 'nearby_places_screen.dart';
import 'music_screen.dart';
import 'trip_completion_screen.dart';

class LiveNavigationScreen extends StatefulWidget {
  const LiveNavigationScreen({super.key});

  @override
  State<LiveNavigationScreen> createState() => _LiveNavigationScreenState();
}

class _LiveNavigationScreenState extends State<LiveNavigationScreen>
    with TickerProviderStateMixin {
  // Existing UI state
  int _currentSpeed = 80;
  final String _eta = '5h 12m';
  final String _distance = '368 km';
  final String _arrivalTime = '4:53 PM';
  final bool _showMemberBubbles = true;

  // New location state
  Position? _currentPosition;
  bool _loadingLocation = true;
  GoogleMapController? _mapController;
  StreamSubscription<Position?>? _locationSub;

  late Timer _speedTimer;
  late AnimationController _pulseController;


  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    // Start listening to location updates
    _locationSub = LocationService.getLocationStream().listen((position) {
      if (!mounted) return;
      setState(() {
        _currentPosition = position;
        if (position != null) {
          _loadingLocation = false;
        }
      });
    });

    // Simulate speed changes
    _speedTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted) {
        setState(() {
          _currentSpeed = 60 + Random().nextInt(40);
        });
      }
    });
  }

  @override
  void dispose() {
    _locationSub?.cancel();
    _speedTimer.cancel();
    _pulseController.dispose();
    super.dispose();

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: Stack(
        children: [
          // ── Real Google Map ──
          Positioned.fill(
            child: _loadingLocation
                ? const Center(child: CircularProgressIndicator())
                : GoogleMap(
                    initialCameraPosition: CameraPosition(
                      target: _currentPosition != null
                          ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
                          : const LatLng(0, 0),
                      zoom: 15,
                    ),
                    myLocationEnabled: false,
                    markers: _currentPosition != null
                        ? {
                            Marker(
                              markerId: const MarkerId('current'),
                              position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                              icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
                            ),
                          }
                        : {},
                    onMapCreated: (GoogleMapController controller) {
                      _mapController = controller;
                      if (_currentPosition != null) {
                        controller.moveCamera(
                          CameraUpdate.newLatLng(
                            LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                          ),
                        );
                      }
                    },
                  ),
          ),

          // ── Top navigation bar ──
          SafeArea(
            child: Column(
              children: [
                // ── Direction instruction ──
                Container(
                      margin: const EdgeInsets.all(16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withValues(alpha: 0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.turn_right_rounded,
                              color: Colors.white,
                              size: 28,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text(
                                      '750 ',
                                      style: TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.white,
                                      ),
                                    ),
                                    Text(
                                      'm',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.white.withValues(
                                          alpha: 0.7,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  'Take left under the flyover',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.white.withValues(alpha: 0.8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )
                    .animate()
                    .slideY(begin: -0.5, end: 0, duration: 500.ms)
                    .fadeIn(),
              ],
            ),
          ),

          // ── Member bubbles on map ──
          if (_showMemberBubbles) ...[
            // Sumanth - ahead
            Positioned(
              top: MediaQuery.of(context).size.height * 0.25,
              right: 50,
              child: _memberBubble('Sumanth', '10 m ahead', Colors.blue),
            ),
            // Rohith - behind
            Positioned(
              top: MediaQuery.of(context).size.height * 0.45,
              left: 40,
              child: _memberBubble('Rohith', '20 m behind', Colors.orange),
            ),
          ],

          // ── Speed indicator ──
          Positioned(bottom: 180, left: 20, child: _speedWidget()),

          // ── Bottom info panel ──
          Positioned(bottom: 0, left: 0, right: 0, child: _bottomPanel()),
          // Recenter FAB
          Positioned(
            bottom: 100,
            right: 20,
            child: FloatingActionButton(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              onPressed: () {
                if (_currentPosition != null && _mapController != null) {
                  _mapController!.animateCamera(
                    CameraUpdate.newLatLng(
                      LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                    ),
                  );
                }
              },
              child: const Icon(Icons.my_location),
            ),
          ),
        ],
      ),
    );
  }

  Widget _memberBubble(String name, String info, Color color) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: AppTheme.darkCard.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withValues(alpha: 0.5)),
            boxShadow: [
              BoxShadow(
                color: color.withValues(
                  alpha: 0.2 + _pulseController.value * 0.1,
                ),
                blurRadius: 12,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: color,
                child: Text(
                  name[0],
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    info,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    ).animate().fadeIn(delay: 800.ms, duration: 500.ms);
  }

  Widget _speedWidget() {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppTheme.darkCard,
        border: Border.all(color: AppTheme.primary, width: 3),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.3),
            blurRadius: 16,
            spreadRadius: 2,
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
              fontSize: 26,
              fontWeight: FontWeight.w900,
            ),
          ),
          Text(
            'km/h',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _bottomPanel() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
      decoration: BoxDecoration(
        color: AppTheme.darkCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Handle ──
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),

          // ── ETA Row ──
          Row(
            children: [
              // ETA info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _eta,
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$_distance  •  $_arrivalTime',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
              ),

              // End button
              ElevatedButton(
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const TripCompletionScreen(),
                    ),
                  );
                },
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

          const SizedBox(height: 18),

          // ── Quick action buttons ──
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _actionButton(
                Icons.groups_rounded,
                'Members',
                AppTheme.membersPurple,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const MembersListScreen()),
                ),
              ),
              _actionButton(
                Icons.location_on_rounded,
                'Nearby',
                AppTheme.nearbyPink,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const NearbyPlacesScreen()),
                ),
              ),
              _actionButton(
                Icons.music_note_rounded,
                'Music',
                AppTheme.spotify,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const MusicScreen()),
                ),
              ),
              _actionButton(
                Icons.share_location_rounded,
                'Share',
                AppTheme.navBlue,
                () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Location sharing active')),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _actionButton(
    IconData icon,
    String label,
    Color color,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

// Simple map painter for visual representation
class _MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final roadPaint = Paint()
      ..color = const Color(0xFF2A4A5E)
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final routePaint = Paint()
      ..color = AppTheme.primary
      ..strokeWidth = 5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Draw grid lines (roads)
    for (var i = 0; i < 8; i++) {
      final y = size.height * (i / 8.0);
      canvas.drawLine(
        Offset(0, y),
        Offset(size.width, y),
        roadPaint..color = const Color(0xFF1E3A4E).withValues(alpha: 0.3),
      );
    }
    for (var i = 0; i < 6; i++) {
      final x = size.width * (i / 6.0);
      canvas.drawLine(
        Offset(x, 0),
        Offset(x, size.height),
        roadPaint..color = const Color(0xFF1E3A4E).withValues(alpha: 0.3),
      );
    }

    // Draw main route path
    final routePath = Path()
      ..moveTo(size.width * 0.5, size.height)
      ..cubicTo(
        size.width * 0.5,
        size.height * 0.7,
        size.width * 0.3,
        size.height * 0.5,
        size.width * 0.6,
        size.height * 0.3,
      )
      ..cubicTo(
        size.width * 0.8,
        size.height * 0.15,
        size.width * 0.7,
        size.height * 0.05,
        size.width * 0.5,
        0,
      );

    canvas.drawPath(routePath, routePaint);

    // Draw current position dot
    final dotPaint = Paint()
      ..color = AppTheme.mint
      ..style = PaintingStyle.fill;

    canvas.drawCircle(
      Offset(size.width * 0.5, size.height * 0.65),
      8,
      dotPaint,
    );

    // Draw glow around position
    final glowPaint = Paint()
      ..color = AppTheme.mint.withValues(alpha: 0.3)
      ..style = PaintingStyle.fill;

    canvas.drawCircle(
      Offset(size.width * 0.5, size.height * 0.65),
      20,
      glowPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
