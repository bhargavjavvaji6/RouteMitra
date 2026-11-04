import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../models/route_plan.dart';
import '../services/directions_service.dart';
import '../services/location_service.dart';
import '../services/trip_service.dart';
import '../services/route_cache_service.dart';
import '../services/voice_navigation_service.dart';
import 'arrival_screen.dart';

class LiveNavigationScreen extends StatefulWidget {
  const LiveNavigationScreen(
      {super.key, required this.tripId, required this.plan});
  final String tripId;
  final RoutePlan plan;
  @override
  State<LiveNavigationScreen> createState() => _LiveNavigationScreenState();
}

class _LiveNavigationScreenState extends State<LiveNavigationScreen> {
  final _location = LocationService(),
      _trips = TripService(),
      _cache = RouteCacheService(),
      _voice = VoiceNavigationService();
  GoogleMapController? _map;
  StreamSubscription<Position>? _gps;
  StreamSubscription<QuerySnapshot<Map<String, dynamic>>>? _members;
  LatLng? _me;
  Set<Marker> _memberMarkers = {};
  int _step = 0;
  bool _arrived = false, _voiceEnabled = true;
  DateTime _lastSpoken = DateTime.fromMillisecondsSinceEpoch(0);
  static const _arrivalMeters = 80.0;
  @override
  void initState() {
    super.initState();
    _cache.save(widget.plan);
    _voice.initialize();
    _start();
  }

  Future<void> _start() async {
    try {
      final p = await _location.currentPosition();
      if (!mounted) return;
      _updatePosition(p);
      _gps = _location.positions().listen(_updatePosition);
      _members = _trips.members(widget.tripId).listen((s) {
        final next = <Marker>{};
        for (final d in s.docs) {
          final x = d.data(), lat = x['latitude'], lng = x['longitude'];
          if (lat is num && lng is num)
            next.add(Marker(
                markerId: MarkerId(d.id),
                position: LatLng(lat.toDouble(), lng.toDouble()),
                infoWindow: InfoWindow(
                    title: (x['name'] ?? 'Convoy member').toString())));
        }
        if (mounted) setState(() => _memberMarkers = next);
      });
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _updatePosition(Position p) async {
    final point = LatLng(p.latitude, p.longitude);
    if (!mounted) return;
    setState(() => _me = point);
    try {
      await _trips.updateMyLocation(widget.tripId, p.latitude, p.longitude);
    } catch (_) {}
    final target =
        LatLng(widget.plan.destinationLat, widget.plan.destinationLng);
    final meters = Geolocator.distanceBetween(
        p.latitude, p.longitude, target.latitude, target.longitude);
    if (meters <= _arrivalMeters && !_arrived) {
      _arrived = true;
      await _voice.stop();
      if (mounted)
        Navigator.pushReplacement(
            context,
            MaterialPageRoute(
                builder: (_) => ArrivalScreen(
                    plan: widget.plan, onDone: () => Navigator.pop(context))));
      return;
    }
    _advanceStep(p);
  }

  void _advanceStep(Position p) {
    if (widget.plan.steps.isEmpty || _step >= widget.plan.steps.length) return;
    final s = widget.plan.steps[_step];
    final d =
        Geolocator.distanceBetween(p.latitude, p.longitude, s.endLat, s.endLng);
    if (d < 45 && _step < widget.plan.steps.length - 1) {
      setState(() => _step++);
      final now = DateTime.now();
      if (_voiceEnabled &&
          now.difference(_lastSpoken) > const Duration(seconds: 5)) {
        _lastSpoken = now;
        _voice.speak(widget.plan.steps[_step].instruction);
      }
    }
  }

  Set<Polyline> get _lines => {
        Polyline(
            polylineId: const PolylineId('route'),
            points: _decode(widget.plan.encodedPolyline),
            width: 6,
            color: const Color(0xff00d9e8))
      };
  List<LatLng> _decode(String encoded) {
    final points = <LatLng>[];
    int i = 0, lat = 0, lng = 0;
    while (i < encoded.length) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(i++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20 && i < encoded.length);
      lat += (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(i++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20 && i < encoded.length);
      lng += (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
      points.add(LatLng(lat / 1e5, lng / 1e5));
    }
    return points;
  }

  @override
  void dispose() {
    _gps?.cancel();
    _members?.cancel();
    _map?.dispose();
    _voice.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dest = LatLng(widget.plan.destinationLat, widget.plan.destinationLng);
    final markers = <Marker>{
      ..._memberMarkers,
      Marker(
          markerId: const MarkerId('destination'),
          position: dest,
          infoWindow: InfoWindow(title: widget.plan.destinationName)),
      if (_me != null)
        Marker(
            markerId: const MarkerId('me'),
            position: _me!,
            infoWindow: const InfoWindow(title: 'You'),
            icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueAzure))
    };
    final current = widget.plan.steps.isEmpty ? null : widget.plan.steps[_step];
    return Scaffold(
        appBar: AppBar(title: const Text('Live convoy navigation'), actions: [
          IconButton(
              tooltip: 'Voice guidance',
              icon: Icon(_voiceEnabled ? Icons.volume_up : Icons.volume_off),
              onPressed: () => setState(() => _voiceEnabled = !_voiceEnabled)),
          IconButton(
              icon: const Icon(Icons.my_location),
              onPressed: () => _me == null
                  ? null
                  : _map?.animateCamera(CameraUpdate.newLatLngZoom(_me!, 16))),
        ]),
        body: Stack(children: [
          GoogleMap(
              initialCameraPosition:
                  CameraPosition(target: _me ?? dest, zoom: 14),
              onMapCreated: (c) => _map = c,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              markers: markers,
              polylines: _lines),
          Positioned(
              left: 12,
              right: 12,
              top: 12,
              child: Card(
                  color: const Color(0xff102a43),
                  child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                                current?.instruction ??
                                    'Follow the highlighted route',
                                style: const TextStyle(
                                    fontSize: 17, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 5),
                            Text(
                                '${current?.distanceText ?? widget.plan.distanceText} • ${widget.plan.durationText} remaining'),
                            const SizedBox(height: 5),
                            Text(
                                '${_memberMarkers.length} convoy members connected'),
                          ])))),
          Positioned(
              left: 12,
              right: 12,
              bottom: 14,
              child: FilledButton.tonalIcon(
                  onPressed: () => showDialog(
                      context: context,
                      builder: (c) => AlertDialog(
                              title: const Text('End navigation?'),
                              content: const Text(
                                  'Stop sharing your live location?'),
                              actions: [
                                TextButton(
                                    onPressed: () => Navigator.pop(c),
                                    child: const Text('Continue')),
                                FilledButton(
                                    onPressed: () async {
                                      await _gps?.cancel();
                                      if (context.mounted) {
                                        Navigator.pop(c);
                                        Navigator.pop(context);
                                      }
                                    },
                                    child: const Text('Stop')),
                              ])),
                  icon: const Icon(Icons.stop_circle_outlined),
                  label: const Text('Stop navigation'))),
        ]));
  }
}
