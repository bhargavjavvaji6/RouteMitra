import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/app_theme.dart';
import 'login_screen.dart';
import 'start_trip_screen.dart';
import 'live_navigation_screen.dart';
import 'members_list_screen.dart';
import 'nearby_places_screen.dart';
import 'music_screen.dart';
import 'group_notification_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.userName,
    required this.userEmail,
    required this.userId,
  });

  final String userName;
  final String userEmail;
  final String userId;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  String get _firstName {
    final parts = widget.userName.trim().split(' ');
    return parts.isEmpty ? 'Traveller' : parts.first;
  }

  Future<void> _signOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppTheme.darkCard,
          title: const Text('Sign out?', style: TextStyle(color: Colors.white)),
          content: Text(
            'You will return to the Sign In screen.',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('Sign Out'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) return;

    final preferences = await SharedPreferences.getInstance();

    await preferences.remove('user_name');
    await preferences.remove('user_email');
    await preferences.remove('user_id');

    if (!mounted) return;

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  void _navigateTo(Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  Widget _featureCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(19),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(19),
        child: Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(19),
            border: Border.all(color: color.withValues(alpha: 0.15)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 43,
                width: 43,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const Spacer(),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.white.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _quickStartCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: Material(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(17),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(17),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(17),
              border: Border.all(color: color.withValues(alpha: 0.15)),
            ),
            child: Row(
              children: [
                Icon(icon, color: color, size: 29),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.white.withValues(alpha: 0.5),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        backgroundColor: AppTheme.darkBg,
        toolbarHeight: 82,
        title: Row(
          children: [
            // ── Avatar ──
            Container(
              width: 47,
              height: 47,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primary, AppTheme.mint],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text(
                  _firstName[0].toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _firstName,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'ID: ${widget.userId}',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withValues(alpha: 0.5),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => _navigateTo(const GroupNotificationScreen()),
            icon: Stack(
              children: [
                const Icon(
                  Icons.notifications_none_rounded,
                  color: Colors.white,
                ),
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            tooltip: 'Account options',
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white),
            color: AppTheme.darkCard,
            onSelected: (value) {
              if (value == 'logout') {
                _signOut();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    const Icon(Icons.person_outline, color: Colors.white70),
                    const SizedBox(width: 10),
                    Text(
                      'My Profile',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    const Icon(Icons.logout_rounded, color: Colors.red),
                    const SizedBox(width: 10),
                    const Text('Sign Out', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(width: 5),
        ],
      ),
      body: SafeArea(
        child: IndexedStack(
          index: _selectedIndex,
          children: [
            _buildDashboard(),
            _buildPlaceholder(
              Icons.map_outlined,
              'Explore Map',
              'Your map and location features will appear here.',
            ),
            _buildPlaceholder(
              Icons.luggage_outlined,
              'My Trips',
              'Your upcoming and previous trips will appear here.',
            ),
            _buildPlaceholder(
              Icons.person_outline_rounded,
              'My Profile',
              widget.userEmail,
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.darkCard,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: NavigationBar(
          backgroundColor: AppTheme.darkCard,
          indicatorColor: AppTheme.primary.withValues(alpha: 0.2),
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) {
            setState(() => _selectedIndex = index);
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined, color: Colors.white54),
              selectedIcon: Icon(Icons.home_rounded, color: AppTheme.mint),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.map_outlined, color: Colors.white54),
              selectedIcon: Icon(Icons.map_rounded, color: AppTheme.mint),
              label: 'Map',
            ),
            NavigationDestination(
              icon: Icon(Icons.luggage_outlined, color: Colors.white54),
              selectedIcon: Icon(Icons.luggage_rounded, color: AppTheme.mint),
              label: 'Trips',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline, color: Colors.white54),
              selectedIcon: Icon(Icons.person, color: AppTheme.mint),
              label: 'Profile',
            ),
          ],
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        ),
      ),
    );
  }

  Widget _buildDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 10, 18, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Search bar ──
          Container(
            decoration: BoxDecoration(
              color: AppTheme.darkSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF2D3D4F)),
            ),
            child: TextField(
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                prefixIcon: Icon(
                  Icons.search,
                  color: Colors.white.withValues(alpha: 0.5),
                ),
                hintText: 'Search location, place, or member...',
                hintStyle: TextStyle(
                  color: Colors.white.withValues(alpha: 0.4),
                  fontSize: 14,
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                suffixIcon: Icon(
                  Icons.mic_none_rounded,
                  color: Colors.white.withValues(alpha: 0.4),
                ),
              ),
            ),
          ).animate().fadeIn(duration: 400.ms),

          const SizedBox(height: 20),

          // ── Feature grid ──
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 11,
            mainAxisSpacing: 11,
            childAspectRatio: 0.95,
            children: [
              _featureCard(
                title: 'Start Trip',
                subtitle: 'Quick outing',
                icon: Icons.near_me_rounded,
                color: AppTheme.tripGreen,
                onTap: () => _navigateTo(const StartTripScreen()),
              ),
              _featureCard(
                title: 'My Trips',
                subtitle: 'Your journeys',
                icon: Icons.luggage_rounded,
                color: AppTheme.tripYellow,
                onTap: () => setState(() => _selectedIndex = 2),
              ),
              _featureCard(
                title: 'Live Map',
                subtitle: 'Explore routes',
                icon: Icons.map_rounded,
                color: AppTheme.mapBlue,
                onTap: () => _navigateTo(const LiveNavigationScreen()),
              ),
              _featureCard(
                title: 'Members',
                subtitle: 'Travel together',
                icon: Icons.groups_rounded,
                color: AppTheme.membersPurple,
                onTap: () => _navigateTo(const MembersListScreen()),
              ),
              _featureCard(
                title: 'Nearby Places',
                subtitle: 'Discover places',
                icon: Icons.location_on_rounded,
                color: AppTheme.nearbyPink,
                onTap: () => _navigateTo(const NearbyPlacesScreen()),
              ),
              _featureCard(
                title: 'Music',
                subtitle: 'Journey playlist',
                icon: Icons.music_note_rounded,
                color: AppTheme.musicRed,
                onTap: () => _navigateTo(const MusicScreen()),
              ),
            ],
          ).animate().fadeIn(delay: 100.ms, duration: 400.ms),

          const SizedBox(height: 14),

          // ── Second row of features ──
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 11,
            mainAxisSpacing: 11,
            childAspectRatio: 0.95,
            children: [
              _featureCard(
                title: 'Favorites',
                subtitle: 'Saved places',
                icon: Icons.favorite_rounded,
                color: Colors.redAccent,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Favorites coming soon!')),
                  );
                },
              ),
              _featureCard(
                title: 'History',
                subtitle: 'Past trips',
                icon: Icons.history_rounded,
                color: const Color(0xFFEC4899),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('History coming soon!')),
                  );
                },
              ),
              _featureCard(
                title: 'Settings',
                subtitle: 'Preferences',
                icon: Icons.settings_rounded,
                color: Colors.blueGrey,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Settings coming soon!')),
                  );
                },
              ),
            ],
          ).animate().fadeIn(delay: 200.ms, duration: 400.ms),

          const SizedBox(height: 27),

          // ── Quick Start ──
          const Text(
            'Quick Start',
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 13),

          Row(
            children: [
              _quickStartCard(
                title: 'Quick Trip',
                subtitle: 'Short trip',
                icon: Icons.directions_car_rounded,
                color: AppTheme.primary,
                onTap: () => _navigateTo(const StartTripScreen()),
              ),
              const SizedBox(width: 12),
              _quickStartCard(
                title: 'Planned Trip',
                subtitle: 'Long journey',
                icon: Icons.alt_route_rounded,
                color: const Color(0xFF4F46E5),
                onTap: () =>
                    _navigateTo(const StartTripScreen(isPlanned: true)),
              ),
            ],
          ).animate().fadeIn(delay: 300.ms, duration: 400.ms),

          const SizedBox(height: 18),

          // ── Bottom bar shortcut buttons ──
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _bottomShortcut(
                Icons.map_rounded,
                'Map',
                () => _navigateTo(const LiveNavigationScreen()),
              ),
              _bottomShortcut(
                Icons.add_circle_rounded,
                'New Trip',
                () => _navigateTo(const StartTripScreen()),
              ),
              _bottomShortcut(
                Icons.music_note_rounded,
                'Music',
                () => _navigateTo(const MusicScreen()),
              ),
              _bottomShortcut(
                Icons.luggage_rounded,
                'Trips',
                () => setState(() => _selectedIndex = 2),
              ),
            ],
          ).animate().fadeIn(delay: 400.ms, duration: 400.ms),

          const SizedBox(height: 24),

          // ── Safety banner ──
          Container(
            padding: const EdgeInsets.all(17),
            decoration: BoxDecoration(
              color: AppTheme.darkCard,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFF2D3D4F)),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.shield_outlined,
                    color: AppTheme.mint,
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Your journey, your control',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        'Location sharing will require your permission.',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.45),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 500.ms, duration: 400.ms),
        ],
      ),
    );
  }

  Widget _bottomShortcut(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppTheme.darkSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF2D3D4F)),
            ),
            child: Icon(icon, color: AppTheme.mint, size: 24),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholder(IconData icon, String title, String description) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 85,
              width: 85,
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(27),
              ),
              child: Icon(icon, color: AppTheme.mint, size: 42),
            ),
            const SizedBox(height: 22),
            Text(
              title,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 9),
            Text(
              description,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.5),
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
