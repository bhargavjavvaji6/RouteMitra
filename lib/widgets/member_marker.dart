import 'package:google_maps_flutter/google_maps_flutter.dart';
class MemberMarker {
  static Marker create({required String id, required String name, required double latitude, required double longitude, bool isCurrentUser = false}) => Marker(
    markerId: MarkerId(id), position: LatLng(latitude, longitude), infoWindow: InfoWindow(title: name),
    icon: BitmapDescriptor.defaultMarkerWithHue(isCurrentUser ? BitmapDescriptor.hueAzure : BitmapDescriptor.hueOrange));
}
