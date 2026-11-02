import 'package:geolocator/geolocator.dart';
class LocationService {
  Future<void> ensurePermission() async {
    if (!await Geolocator.isLocationServiceEnabled()) throw Exception('Enable Location services on your device.');
    var p = await Geolocator.checkPermission();
    if (p == LocationPermission.denied) p = await Geolocator.requestPermission();
    if (p == LocationPermission.denied || p == LocationPermission.deniedForever) throw Exception('Location permission was not granted. Enable it in Settings.');
  }
  Future<Position> currentPosition() async {
    await ensurePermission();
    return Geolocator.getCurrentPosition(locationSettings: const LocationSettings(accuracy: LocationAccuracy.high));
  }
  Stream<Position> positionStream() async* {
    await ensurePermission();
    yield* Geolocator.getPositionStream(locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 5));
  }
}
