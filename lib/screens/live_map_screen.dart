import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../models/trip_model.dart';
import '../services/location_service.dart';
import '../services/tracking_service.dart';
import '../services/trip_service.dart';
import '../widgets/trip_info_panel.dart';
class LiveMapScreen extends StatefulWidget { const LiveMapScreen({super.key, required this.trip}); final TripModel trip; @override State<LiveMapScreen> createState() => _LiveMapScreenState(); }
class _LiveMapScreenState extends State<LiveMapScreen> {
  final _location = LocationService(); final _tracking = TrackingService(); final _trips = TripService();
  GoogleMapController? _controller; Position? _position; StreamSubscription<DocumentSnapshot<Map<String, dynamic>>>? _subscription;
  Map<String, dynamic> _members = {}; String? _error; bool _trackingStarted = false;
  @override void initState() { super.initState(); _loadLocation(); _subscription = _trips.watchTripDocument(widget.trip.id).listen((s) {
    if (!mounted || !s.exists) return; final m = s.data()!['members']; setState(() => _members = m is Map<String, dynamic> ? m : {});
  }, onError: (Object e) { if (mounted) setState(() => _error = 'Trip updates failed: $e'); }); }
  Future<void> _loadLocation() async {
    try { final p = await _location.currentPosition(); if (!mounted) return; setState(() => _position = p);
      final user = FirebaseAuth.instance.currentUser; if (user != null) { await _tracking.start(tripId: widget.trip.id, userId: user.uid, userName: user.displayName ?? user.email ?? 'Traveller'); _trackingStarted = true; }
      _controller?.animateCamera(CameraUpdate.newLatLngZoom(LatLng(p.latitude, p.longitude), 15));
    } catch (e) { if (mounted) setState(() => _error = e.toString()); }
  }
  Set<Marker> _markers() {
    final markers = <Marker>{};
    _members.forEach((uid, v) { if (v is! Map) return; final lat = v['latitude'], lng = v['longitude']; if (lat is! num || lng is! num) return;
      markers.add(Marker(markerId: MarkerId(uid.toString()), position: LatLng(lat.toDouble(), lng.toDouble()), infoWindow: InfoWindow(title: v['name']?.toString() ?? 'Member'),
        icon: BitmapDescriptor.defaultMarkerWithHue(uid == FirebaseAuth.instance.currentUser?.uid ? BitmapDescriptor.hueAzure : BitmapDescriptor.hueOrange)));
    });
    final p = _position; if (p != null) markers.add(Marker(markerId: const MarkerId('current-location'), position: LatLng(p.latitude, p.longitude), infoWindow: const InfoWindow(title: 'My location')));
    return markers;
  }
  @override void dispose() { _subscription?.cancel(); if (_trackingStarted) _tracking.stop(); _controller?.dispose(); super.dispose(); }
  Future<void> _closeTrip() async {
    if (FirebaseAuth.instance.currentUser?.uid != widget.trip.ownerId) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Only the trip owner can close this trip.'))); return; }
    try { await _trips.closeTrip(widget.trip.id); if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trip closed.'))); }
    catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not close trip: $e'))); }
  }
  @override Widget build(BuildContext context) { final p = _position; return Scaffold(appBar: AppBar(title: Text(widget.trip.name), actions: [IconButton(onPressed: _closeTrip, icon: const Icon(Icons.stop_circle_outlined), tooltip: 'Close trip')]),
    body: Stack(children: [
      GoogleMap(initialCameraPosition: CameraPosition(target: p == null ? const LatLng(17.3850, 78.4867) : LatLng(p.latitude, p.longitude), zoom: p == null ? 5 : 15),
        onMapCreated: (c) { _controller = c; final pos = _position; if (pos != null) c.animateCamera(CameraUpdate.newLatLngZoom(LatLng(pos.latitude, pos.longitude), 15)); },
        myLocationEnabled: true, myLocationButtonEnabled: true, markers: _markers()),
      Positioned(left: 12, right: 12, top: 12, child: TripInfoPanel(tripId: widget.trip.id, memberCount: _members.length, destination: widget.trip.destination)),
      if (_error != null) Positioned(left: 12, right: 12, bottom: 16, child: Material(color: Colors.white, borderRadius: BorderRadius.circular(12), child: Padding(padding: const EdgeInsets.all(12), child: Text(_error!, style: const TextStyle(color: Colors.red)))))
    ])); }
}
