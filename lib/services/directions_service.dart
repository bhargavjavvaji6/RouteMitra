import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/route_plan.dart';

const _mapsKey = String.fromEnvironment('GOOGLE_MAPS_API_KEY');

class PlaceSuggestion {
  const PlaceSuggestion({required this.description, required this.placeId});
  final String description, placeId;
}

class DirectionsService {
  Future<List<PlaceSuggestion>> searchPlaces(String query) async {
    if (_mapsKey.isEmpty)
      throw Exception(
          'Configure GOOGLE_MAPS_API_KEY before searching destinations.');
    if (query.trim().length < 3) return [];
    final uri = Uri.https(
        'maps.googleapis.com',
        '/maps/api/place/autocomplete/json',
        {'input': query.trim(), 'key': _mapsKey, 'components': 'country:in'});
    final response = await http.get(uri);
    if (response.statusCode != 200)
      throw Exception('Places search failed (${response.statusCode}).');
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (data['status'] != 'OK' && data['status'] != 'ZERO_RESULTS') {
      throw Exception('Places API: ${data['error_message'] ?? data['status']}');
    }
    return (data['predictions'] as List? ?? [])
        .map((p) => PlaceSuggestion(
            description: p['description'], placeId: p['place_id']))
        .toList();
  }

  Future<({double lat, double lng})> placeCoordinates(String placeId) async {
    final uri = Uri.https(
        'maps.googleapis.com', '/maps/api/place/details/json', {
      'place_id': placeId,
      'fields': 'geometry/location,name',
      'key': _mapsKey
    });
    final response = await http.get(uri);
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200 || data['status'] != 'OK') {
      throw Exception('Could not load destination details: ${data['status']}');
    }
    final loc = data['result']['geometry']['location'];
    return (
      lat: (loc['lat'] as num).toDouble(),
      lng: (loc['lng'] as num).toDouble()
    );
  }

  Future<RoutePlan> directions(
      {required double originLat,
      required double originLng,
      required double destinationLat,
      required double destinationLng,
      required String destinationName}) async {
    if (_mapsKey.isEmpty)
      throw Exception('Configure GOOGLE_MAPS_API_KEY to request directions.');
    final uri = Uri.https('maps.googleapis.com', '/maps/api/directions/json', {
      'origin': '$originLat,$originLng',
      'destination': '$destinationLat,$destinationLng',
      'mode': 'driving',
      'departure_time': 'now',
      'key': _mapsKey,
    });
    final response = await http.get(uri);
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200 || data['status'] != 'OK') {
      throw Exception(
          'Directions API: ${data['error_message'] ?? data['status']}');
    }
    final route = (data['routes'] as List).first;
    final leg = (route['legs'] as List).first;
    final steps = (leg['steps'] as List).map((s) {
      final a = s['start_location'], b = s['end_location'];
      return RouteStep(
          instruction: _stripHtml(s['html_instructions'] ?? 'Continue'),
          distanceText: s['distance']['text'] ?? '',
          durationText: s['duration']['text'] ?? '',
          startLat: (a['lat'] as num).toDouble(),
          startLng: (a['lng'] as num).toDouble(),
          endLat: (b['lat'] as num).toDouble(),
          endLng: (b['lng'] as num).toDouble(),
          maneuver: s['maneuver'] ?? '');
    }).toList();
    return RoutePlan(
        destinationName: destinationName,
        destinationLat: destinationLat,
        destinationLng: destinationLng,
        encodedPolyline: route['overview_polyline']['points'],
        distanceText: leg['distance']['text'] ?? '',
        durationText: leg['duration']['text'] ?? '',
        steps: steps);
  }

  String _stripHtml(String value) => value
      .replaceAll(RegExp(r'<[^>]*>'), '')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&amp;', '&');
}
