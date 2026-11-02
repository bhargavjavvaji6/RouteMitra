import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'location_service.dart';
import 'trip_service.dart';
class TrackingService {
  TrackingService({LocationService? location, TripService? trips}) : _location = location ?? LocationService(), _trips = trips ?? TripService();
  final LocationService _location; final TripService _trips;
  StreamSubscription<Position>? _sub;
  Future<void> start({required String tripId, required String userId, required String userName}) async {
    await stop();
    _sub = _location.positionStream().listen((p) {
      _trips.updateMemberLocation(tripId: tripId, userId: userId, userName: userName, latitude: p.latitude, longitude: p.longitude);
    });
  }
  Future<void> stop() async { await _sub?.cancel(); _sub = null; }
}
