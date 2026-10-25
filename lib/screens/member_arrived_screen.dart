import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/app_theme.dart';

class MemberArrivedScreen extends StatelessWidget {
  const MemberArrivedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      _ArrivalNotification(
        name: 'Rohith',
        message: 'reached the destination 🎉',
        timeAgo: '1 min ago',
        color: AppTheme.mint,
        icon: Icons.check_circle_rounded,
      ),
      _ArrivalNotification(
        name: 'Sumanth',
        message: 'reached the destination',
        timeAgo: '3 mins ago',
        color: Colors.blue,
        icon: Icons.check_circle_rounded,
      ),
      _ArrivalNotification(
        name: 'Karthik',
        message: 'is 5 km away',
        timeAgo: 'ETA: 8 mins',
        color: Colors.orange,
        icon: Icons.near_me_rounded,
        isLive: true,
      ),
      _ArrivalNotification(
        name: 'All members',
        message: 'have reached the destination!',
        timeAgo: '2 mins ago',
        color: AppTheme.primary,
        icon: Icons.groups_rounded,
        isGroupNotification: true,
      ),
    ];

    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        backgroundColor: AppTheme.darkBg,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Arrival Updates',
          style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.mint.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.mint,
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  'Real-time',
                  style: TextStyle(
                    color: AppTheme.mint,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final notif = notifications[index];
          return _notificationCard(notif, index);
        },
      ),
    );
  }

  Widget _notificationCard(_ArrivalNotification notif, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: notif.isGroupNotification
            ? AppTheme.primary.withValues(alpha: 0.1)
            : AppTheme.darkCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: notif.isGroupNotification
              ? AppTheme.primary.withValues(alpha: 0.3)
              : const Color(0xFF2D3D4F),
        ),
      ),
      child: Row(
        children: [
          // ── Avatar / Icon ──
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  notif.color.withValues(alpha: 0.6),
                  notif.color,
                ],
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: notif.isGroupNotification
                ? Icon(notif.icon, color: Colors.white, size: 24)
                : Center(
                    child: Text(
                      notif.name[0],
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
          ),
          const SizedBox(width: 14),

          // ── Content ──
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: notif.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      TextSpan(
                        text: ' ${notif.message}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(
                      Icons.access_time_rounded,
                      color: Colors.white.withValues(alpha: 0.3),
                      size: 14,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      notif.timeAgo,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.35),
                        fontSize: 12,
                      ),
                    ),
                    if (notif.isLive) ...[
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: notif.color.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: notif.color,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Live location',
                              style: TextStyle(
                                color: notif.color,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // ── Status icon ──
          Icon(
            notif.icon,
            color: notif.color.withValues(alpha: 0.6),
            size: 22,
          ),
        ],
      ),
    ).animate(delay: Duration(milliseconds: 150 * index))
        .fadeIn(duration: 400.ms)
        .slideX(begin: 0.15, end: 0, duration: 400.ms);
  }
}

class _ArrivalNotification {
  final String name;
  final String message;
  final String timeAgo;
  final Color color;
  final IconData icon;
  final bool isLive;
  final bool isGroupNotification;

  _ArrivalNotification({
    required this.name,
    required this.message,
    required this.timeAgo,
    required this.color,
    required this.icon,
    this.isLive = false,
    this.isGroupNotification = false,
  });
}
