import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/app_theme.dart';
import '../models/trip_models.dart';

class GroupNotificationScreen extends StatefulWidget {
  const GroupNotificationScreen({super.key});

  @override
  State<GroupNotificationScreen> createState() =>
      _GroupNotificationScreenState();
}

class _GroupNotificationScreenState extends State<GroupNotificationScreen> {
  final List<GroupNotification> _notifications = [
    GroupNotification(
      senderName: 'Karthik',
      type: 'place_request',
      title: 'Italian Bistro',
      subtitle: 'Restaurant • Italian',
      distance: '3.5 km from route',
      timeAgo: '5 mins ago',
    ),
    GroupNotification(
      senderName: 'Sumanth',
      type: 'fuel_stop',
      title: 'Indian Oil Petrol Bunk',
      subtitle: 'NH16, Anakapalli',
      distance: '2.1 km from route',
      timeAgo: '10 mins ago',
    ),
  ];

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
        title: const Text(
          'Place Request',
          style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _notifications.length,
        itemBuilder: (context, index) {
          return _notificationCard(_notifications[index], index);
        },
      ),
    );
  }

  Widget _notificationCard(GroupNotification notif, int index) {
    final isPending = !notif.isApproved && !notif.isDenied;
    final icon = notif.type == 'place_request'
        ? Icons.restaurant_rounded
        : Icons.local_gas_station_rounded;
    final iconColor = notif.type == 'place_request'
        ? AppTheme.nearbyPink
        : AppTheme.tripYellow;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.darkCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isPending
              ? iconColor.withValues(alpha: 0.3)
              : const Color(0xFF2D3D4F),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Sender info ──
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: iconColor.withValues(alpha: 0.2),
                child: Text(
                  notif.senderName[0],
                  style: TextStyle(
                    color: iconColor,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: notif.senderName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                      TextSpan(
                        text: notif.type == 'place_request'
                            ? ' suggested a place'
                            : ' suggested a fuel stop',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (notif.timeAgo != null)
                Text(
                  notif.timeAgo!,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.35),
                    fontSize: 11,
                  ),
                ),
            ],
          ),

          const SizedBox(height: 14),

          // ── Place card ──
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.darkSurface,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: iconColor, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        notif.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (notif.subtitle != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          notif.subtitle!,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                            fontSize: 12,
                          ),
                        ),
                      ],
                      if (notif.distance != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          notif.distance!,
                          style: TextStyle(
                            color: iconColor.withValues(alpha: 0.8),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),

          if (isPending) ...[
            const SizedBox(height: 14),

            // ── Action buttons ──
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      // View on map
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Opening on map...')),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: const BorderSide(color: Color(0xFF2D3D4F)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      minimumSize: const Size(0, 40),
                    ),
                    child: const Text('View', style: TextStyle(fontSize: 13)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() => notif.isDenied = true);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.withValues(alpha: 0.2),
                      foregroundColor: Colors.red,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      minimumSize: const Size(0, 40),
                    ),
                    child: const Text('Deny', style: TextStyle(fontSize: 13)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() => notif.isApproved = true);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      minimumSize: const Size(0, 40),
                    ),
                    child:
                        const Text('Approve', style: TextStyle(fontSize: 13)),
                  ),
                ),
              ],
            ),
          ] else ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: (notif.isApproved ? AppTheme.primary : Colors.red)
                    .withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    notif.isApproved
                        ? Icons.check_circle_rounded
                        : Icons.cancel_rounded,
                    color: notif.isApproved ? AppTheme.mint : Colors.red,
                    size: 16,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    notif.isApproved ? 'Approved' : 'Denied',
                    style: TextStyle(
                      color: notif.isApproved ? AppTheme.mint : Colors.red,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    ).animate(delay: Duration(milliseconds: 100 * index))
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.1, end: 0, duration: 400.ms);
  }
}
