class RouteStep {
  const RouteStep({
    required this.instruction,
    required this.distanceText,
    required this.durationText,
    required this.startLat,
    required this.startLng,
    required this.endLat,
    required this.endLng,
    this.maneuver = '',
  });

  final String instruction;
  final String distanceText;
  final String durationText;
  final double startLat, startLng, endLat, endLng;
  final String maneuver;

  Map<String, dynamic> toJson() => {
        'instruction': instruction,
        'distanceText': distanceText,
        'durationText': durationText,
        'startLat': startLat,
        'startLng': startLng,
        'endLat': endLat,
        'endLng': endLng,
        'maneuver': maneuver,
      };

  factory RouteStep.fromJson(Map<String, dynamic> j) => RouteStep(
        instruction: j['instruction'] ?? '',
        distanceText: j['distanceText'] ?? '',
        durationText: j['durationText'] ?? '',
        startLat: (j['startLat'] as num).toDouble(),
        startLng: (j['startLng'] as num).toDouble(),
        endLat: (j['endLat'] as num).toDouble(),
        endLng: (j['endLng'] as num).toDouble(),
        maneuver: j['maneuver'] ?? '',
      );
}

class RoutePlan {
  const RoutePlan(
      {required this.destinationName,
      required this.destinationLat,
      required this.destinationLng,
      required this.encodedPolyline,
      required this.distanceText,
      required this.durationText,
      required this.steps});

  final String destinationName;
  final double destinationLat, destinationLng;
  final String encodedPolyline, distanceText, durationText;
  final List<RouteStep> steps;

  Map<String, dynamic> toJson() => {
        'destinationName': destinationName,
        'destinationLat': destinationLat,
        'destinationLng': destinationLng,
        'encodedPolyline': encodedPolyline,
        'distanceText': distanceText,
        'durationText': durationText,
        'steps': steps.map((s) => s.toJson()).toList(),
      };

  factory RoutePlan.fromJson(Map<String, dynamic> j) => RoutePlan(
        destinationName: j['destinationName'] ?? 'Saved destination',
        destinationLat: (j['destinationLat'] as num).toDouble(),
        destinationLng: (j['destinationLng'] as num).toDouble(),
        encodedPolyline: j['encodedPolyline'] ?? '',
        distanceText: j['distanceText'] ?? '',
        durationText: j['durationText'] ?? '',
        steps: ((j['steps'] ?? []) as List)
            .map((e) => RouteStep.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
      );
}
