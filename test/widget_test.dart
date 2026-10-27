import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:routemitra/core/app_theme.dart';
import 'package:routemitra/models/trip_models.dart';
import 'package:routemitra/widgets/feature_card.dart';

void main() {
  group('RouteMitra Models Tests', () {
    test('TripMember creates with proper default values and UUID', () {
      final member = TripMember(
        name: 'Rohith',
        isOrganizer: true,
        status: 'live',
        eta: 'Live now',
      );

      expect(member.name, 'Rohith');
      expect(member.isOrganizer, true);
      expect(member.status, 'live');
      expect(member.id, isNotEmpty);
    });

    test('NearbyPlace initializes with correct category and rating', () {
      final place = NearbyPlace(
        name: 'Indian Oil Petrol Bunk',
        category: 'petrol',
        address: 'NH16, Anakapalli',
        distance: '2 km ahead',
        rating: 4.2,
      );

      expect(place.name, 'Indian Oil Petrol Bunk');
      expect(place.category, 'petrol');
      expect(place.rating, 4.2);
      expect(place.isOpen, isTrue);
    });

    test('GroupNotification handles approval and denial state updates', () {
      final notif = GroupNotification(
        senderName: 'Karthik',
        type: 'place_request',
        title: 'Italian Bistro',
      );

      expect(notif.isApproved, isFalse);
      expect(notif.isDenied, isFalse);

      notif.isApproved = true;
      expect(notif.isApproved, isTrue);

      notif.isApproved = false;
      notif.isDenied = true;
      expect(notif.isDenied, isTrue);
    });

    test('MusicTrack initializes with track info and default duration', () {
      final track = MusicTrack(
        title: 'Highway',
        artist: 'A. R. Rahman',
        source: 'spotify',
      );

      expect(track.title, 'Highway');
      expect(track.artist, 'A. R. Rahman');
      expect(track.source, 'spotify');
      expect(track.isPlaying, isFalse);
    });
  });

  group('RouteMitra UI & Theme Tests', () {
    test('AppTheme brand colors and constants are configured correctly', () {
      expect(AppTheme.primary, const Color(0xFF087F5B));
      expect(AppTheme.primaryDark, const Color(0xFF064E3B));
      expect(AppTheme.mint, const Color(0xFF34D399));
      expect(AppTheme.accent, const Color(0xFF10B981));
      expect(AppTheme.darkBg, const Color(0xFF0F1923));
      expect(AppTheme.darkCard, const Color(0xFF1A2633));
      expect(AppTheme.darkSurface, const Color(0xFF243447));
      expect(AppTheme.spotify, const Color(0xFF1DB954));
      expect(AppTheme.youtube, const Color(0xFFFF0000));
    });

    testWidgets('FeatureCard renders title, subtitle and triggers callback',
        (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: Scaffold(
            body: FeatureCard(
              title: 'Start Trip',
              subtitle: 'Start navigation',
              icon: Icons.navigation_rounded,
              color: AppTheme.primary,
              onTap: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      expect(find.text('Start Trip'), findsOneWidget);
      expect(find.text('Start navigation'), findsOneWidget);
      expect(find.byIcon(Icons.navigation_rounded), findsOneWidget);

      await tester.tap(find.text('Start Trip'));
      await tester.pump();

      expect(tapped, isTrue);
    });
  });
}
