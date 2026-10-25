import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/app_theme.dart';
import '../models/trip_models.dart';

class NearbyPlacesScreen extends StatefulWidget {
  const NearbyPlacesScreen({super.key});

  @override
  State<NearbyPlacesScreen> createState() => _NearbyPlacesScreenState();
}

class _NearbyPlacesScreenState extends State<NearbyPlacesScreen> {
  String _selectedFilter = 'all';
  final _searchController = TextEditingController();

  final List<NearbyPlace> _places = [
    NearbyPlace(
      name: 'Indian Oil Petrol Bunk',
      category: 'petrol',
      address: 'NH16, Anakapalli',
      distance: '2 km ahead',
      isOpen: true,
      openHours: 'Open 24 hours',
      rating: 4.2,
    ),
    NearbyPlace(
      name: 'HP Fuel Station',
      category: 'petrol',
      address: 'Vizag-Hyderabad Highway',
      distance: '5 km ahead',
      isOpen: true,
      rating: 4.0,
    ),
    NearbyPlace(
      name: 'Tata EV Charging',
      category: 'ev',
      address: 'Near Toll Plaza',
      distance: '3.5 km ahead',
      isOpen: true,
      rating: 4.5,
    ),
    NearbyPlace(
      name: 'Italian Bistro',
      category: 'food',
      address: 'Main Road, Town Center',
      distance: '3.5 km from route',
      isOpen: true,
      rating: 4.3,
    ),
    NearbyPlace(
      name: 'Highway Dhaba',
      category: 'food',
      address: 'NH16, Before Toll Gate',
      distance: '1.2 km ahead',
      isOpen: true,
      rating: 3.8,
    ),
  ];

  List<NearbyPlace> get _filteredPlaces {
    if (_selectedFilter == 'all') return _places;
    return _places.where((p) => p.category == _selectedFilter).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: CustomScrollView(
        slivers: [
          // ── App bar with map preview ──
          SliverAppBar(
            backgroundColor: AppTheme.darkBg,
            expandedHeight: 200,
            pinned: true,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.darkCard.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.arrow_back_ios_new,
                    color: Colors.white, size: 18),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      const Color(0xFF1A2E3E),
                      AppTheme.darkBg,
                    ],
                  ),
                ),
                child: CustomPaint(
                  painter: _NearbyMapPainter(),
                ),
              ),
            ),
          ),

          // ── Search and filters ──
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Search bar ──
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppTheme.darkSurface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF2D3D4F)),
                    ),
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        prefixIcon: Icon(
                          Icons.search,
                          color: Colors.white.withValues(alpha: 0.5),
                        ),
                        hintText: 'Search along route...',
                        hintStyle: TextStyle(
                          color: Colors.white.withValues(alpha: 0.4),
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                      ),
                    ),
                  ),
                ),

                // ── Filter chips ──
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      _filterChip('All', 'all', Icons.apps_rounded),
                      const SizedBox(width: 8),
                      _filterChip(
                          'Petrol', 'petrol', Icons.local_gas_station_rounded),
                      const SizedBox(width: 8),
                      _filterChip('EV', 'ev', Icons.ev_station_rounded),
                      const SizedBox(width: 8),
                      _filterChip('Food', 'food', Icons.restaurant_rounded),
                    ],
                  ),
                ).animate().fadeIn(delay: 200.ms, duration: 400.ms),

                const SizedBox(height: 16),
              ],
            ),
          ),

          // ── Places list ──
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final place = _filteredPlaces[index];
                return _placeCard(place, index);
              },
              childCount: _filteredPlaces.length,
            ),
          ),

          const SliverPadding(padding: EdgeInsets.only(bottom: 32)),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String key, IconData icon) {
    final selected = _selectedFilter == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedFilter = key),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected
                ? AppTheme.primary
                : AppTheme.darkSurface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? AppTheme.mint : const Color(0xFF2D3D4F),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: selected ? Colors.white : Colors.white54,
                size: 16,
              ),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  color: selected ? Colors.white : Colors.white54,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeCard(NearbyPlace place, int index) {
    IconData icon;
    Color iconColor;

    switch (place.category) {
      case 'petrol':
        icon = Icons.local_gas_station_rounded;
        iconColor = AppTheme.tripYellow;
        break;
      case 'ev':
        icon = Icons.ev_station_rounded;
        iconColor = AppTheme.navBlue;
        break;
      case 'food':
        icon = Icons.restaurant_rounded;
        iconColor = AppTheme.nearbyPink;
        break;
      default:
        icon = Icons.place_rounded;
        iconColor = AppTheme.mint;
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.darkCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2D3D4F)),
      ),
      child: Row(
        children: [
          // Icon
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 14),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  place.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  place.address,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.5),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      place.distance,
                      style: TextStyle(
                        color: iconColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (place.isOpen) ...[
                      const SizedBox(width: 8),
                      Text(
                        place.openHours ?? 'Open',
                        style: const TextStyle(
                          color: AppTheme.mint,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // Actions
          Column(
            children: [
              IconButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Getting directions to ${place.name}...'),
                    ),
                  );
                },
                icon: const Icon(Icons.directions_rounded, color: AppTheme.navBlue),
                tooltip: 'Directions',
              ),
              IconButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Calling ${place.name}...')),
                  );
                },
                icon: const Icon(Icons.call_rounded, color: AppTheme.mint),
                tooltip: 'Call',
              ),
            ],
          ),
        ],
      ),
    ).animate(delay: Duration(milliseconds: 100 * index))
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.1, end: 0, duration: 400.ms);
  }
}

class _NearbyMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Draw road lines
    final roadPaint = Paint()
      ..color = const Color(0xFF2A4A5E).withValues(alpha: 0.4)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    for (var i = 0; i < 6; i++) {
      final y = size.height * (i / 6.0);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), roadPaint);
    }

    // Draw route
    final routePaint = Paint()
      ..color = AppTheme.primary
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..moveTo(size.width * 0.2, size.height)
      ..cubicTo(
        size.width * 0.3,
        size.height * 0.6,
        size.width * 0.7,
        size.height * 0.4,
        size.width * 0.8,
        0,
      );
    canvas.drawPath(path, routePaint);

    // Draw place markers
    final markerPaint = Paint()
      ..style = PaintingStyle.fill;

    final markers = [
      (0.35, 0.45, AppTheme.tripYellow),
      (0.55, 0.35, AppTheme.nearbyPink),
      (0.65, 0.55, AppTheme.navBlue),
    ];

    for (final (x, y, color) in markers) {
      markerPaint.color = color;
      canvas.drawCircle(
        Offset(size.width * x, size.height * y),
        6,
        markerPaint,
      );
      markerPaint.color = color.withValues(alpha: 0.3);
      canvas.drawCircle(
        Offset(size.width * x, size.height * y),
        12,
        markerPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
