import 'package:geolocator/geolocator.dart';
import 'dart:async';

/// Service responsible for handling location permissions and retrieving
/// the device's current GPS position. It gracefully handles denied permissions
/// and disabled location services, returning `null` in those cases so callers
/// can react appropriately (e.g., show a UI prompt).
class LocationService {
  /// Requests location permission from the user. Returns `true` if permission
  /// is granted (either while in use or always), otherwise `false`.
  static Future<bool> requestPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse) {
      return true;
    }

    permission = await Geolocator.requestPermission();
    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }

  /// Checks whether location services are enabled on the device.
  static Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// Retrieves the current position of the device. If permission is denied or
  /// location services are disabled, returns `null`.
  static Future<Position?> getCurrentLocation({
    LocationAccuracy accuracy = LocationAccuracy.best,
    int timeLimitSeconds = 10,
  }) async {
    final hasPermission = await requestPermission();
    if (!hasPermission) return null;

    final serviceEnabled = await isLocationServiceEnabled();
    if (!serviceEnabled) return null;

    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
        timeLimit: Duration(seconds: timeLimitSeconds),
      );
    } on TimeoutException {
      // Timeout – return null so UI can decide what to do.
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Provides a continuous stream of location updates. The stream respects the
  /// same permission and service checks; it yields `null` if they are not met.
  static Stream<Position?> getLocationStream({
    LocationAccuracy accuracy = LocationAccuracy.best,
    int distanceFilter = 10,
  }) async* {
    final hasPermission = await requestPermission();
    if (!hasPermission) {
      yield null;
      return;
    }
    final serviceEnabled = await isLocationServiceEnabled();
    if (!serviceEnabled) {
      yield null;
      return;
    }
    yield* Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: accuracy,
        distanceFilter: distanceFilter,
      ),
    );
  }
}
