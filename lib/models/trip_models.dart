import 'package:uuid/uuid.dart';

class TripMember {
  final String id;
  final String name;
  final bool isOrganizer;
  final String? status; // 'live', 'ahead', 'behind', 'arrived'
  final String? eta;
  final String? distance;
  final double? lat;
  final double? lng;

  TripMember({
    String? id,
    required this.name,
    this.isOrganizer = false,
    this.status,
    this.eta,
    this.distance,
    this.lat,
    this.lng,
  }) : id = id ?? const Uuid().v4();
}

class NearbyPlace {
  final String name;
  final String category; // 'petrol', 'ev', 'food', 'all'
  final String address;
  final String distance;
  final bool isOpen;
  final String? openHours;
  final double rating;

  NearbyPlace({
    required this.name,
    required this.category,
    required this.address,
    required this.distance,
    this.isOpen = true,
    this.openHours,
    this.rating = 4.0,
  });
}

class GroupNotification {
  final String id;
  final String senderName;
  final String type; // 'place_request', 'fuel_stop', 'member_arrived'
  final String title;
  final String? subtitle;
  final String? distance;
  final String? timeAgo;
  bool isApproved;
  bool isDenied;

  GroupNotification({
    String? id,
    required this.senderName,
    required this.type,
    required this.title,
    this.subtitle,
    this.distance,
    this.timeAgo,
    this.isApproved = false,
    this.isDenied = false,
  }) : id = id ?? const Uuid().v4();
}

class MusicTrack {
  final String title;
  final String artist;
  final String source; // 'spotify', 'youtube', 'device'
  final Duration duration;
  final bool isPlaying;

  MusicTrack({
    required this.title,
    required this.artist,
    this.source = 'spotify',
    this.duration = const Duration(minutes: 3, seconds: 30),
    this.isPlaying = false,
  });
}
