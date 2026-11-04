import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../services/location_service.dart';
import '../services/trip_service.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({super.key, required this.tripId});

  final String tripId;

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen> {
  final LocationService _locationService = LocationService();
  final TripService _tripService = TripService();

  GoogleMapController? _mapController;
  StreamSubscription? _positionSubscription;
  StreamSubscription<QuerySnapshot<Map<String, dynamic>>>? _membersSubscription;

  LatLng? _myPosition;
  Set<Marker> _memberMarkers = <Marker>{};
  bool _sharingLocation = false;
  bool _endingTrip = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _listenToMembers();
    _startLocationSharing();
  }

  void _listenToMembers() {
    _membersSubscription = _tripService.members(widget.tripId).listen(
      (snapshot) {
        final markers = <Marker>{};
        for (final doc in snapshot.docs) {
          final data = doc.data();
          final latitude = data['latitude'];
          final longitude = data['longitude'];
          if (latitude is! num || longitude is! num) continue;

          markers.add(
            Marker(
              markerId: MarkerId(doc.id),
              position: LatLng(latitude.toDouble(), longitude.toDouble()),
              infoWindow: InfoWindow(
                title: (data['name'] ?? 'Convoy member').toString(),
              ),
            ),
          );
        }

        if (mounted) {
          setState(() => _memberMarkers = markers);
        }
      },
      onError: (Object error) {
        if (mounted) setState(() => _error = 'Member updates failed: $error');
      },
    );
  }

  Future<void> _startLocationSharing() async {
    try {
      final initial = await _locationService.currentPosition();
      if (!mounted) return;

      final initialLatLng = LatLng(initial.latitude, initial.longitude);
      setState(() {
        _myPosition = initialLatLng;
        _sharingLocation = true;
        _error = null;
      });

      await _tripService.updateMyLocation(
        widget.tripId,
        initial.latitude,
        initial.longitude,
      );

      await _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(initialLatLng, 15),
      );

      _positionSubscription = _locationService.positions().listen(
        (position) async {
          final point = LatLng(position.latitude, position.longitude);
          if (!mounted) return;

          setState(() => _myPosition = point);

          try {
            await _tripService.updateMyLocation(
              widget.tripId,
              position.latitude,
              position.longitude,
            );
          } catch (error) {
            if (mounted) {
              setState(() => _error = 'Could not share your location: $error');
            }
          }
        },
        onError: (Object error) {
          if (mounted) setState(() => _error = 'GPS error: $error');
        },
      );
    } catch (error) {
      if (mounted) {
        setState(() {
          _sharingLocation = false;
          _error = error.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  Future<void> _endTrip() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('End this trip?'),
        content: const Text(
          'This will mark the convoy trip as completed for all members.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('End trip'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) {
      return;
    }

    setState(() {
      _endingTrip = true;
    });

    try {
      await _tripService.endTrip(widget.tripId);

      if (!mounted) {
        return;
      }

      await _positionSubscription?.cancel();

      if (!mounted) {
        return;
      }

      Navigator.pop(context);
    } catch (error) {
      if (mounted) {
        setState(() {
          _endingTrip = false;
          _error = 'Could not end trip: $error';
        });
      }
    }
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    _membersSubscription?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final markers = <Marker>{
      ..._memberMarkers,
      if (_myPosition != null)
        Marker(
          markerId: const MarkerId('my-location'),
          position: _myPosition!,
          infoWindow: const InfoWindow(title: 'You'),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            BitmapDescriptor.hueAzure,
          ),
        ),
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live convoy map'),
        actions: [
          IconButton(
            tooltip: 'Center on my location',
            onPressed: _myPosition == null
                ? null
                : () => _mapController?.animateCamera(
                      CameraUpdate.newLatLngZoom(_myPosition!, 16),
                    ),
            icon: const Icon(Icons.my_location),
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _myPosition ?? const LatLng(17.3850, 78.4867),
              zoom: 12,
            ),
            onMapCreated: (controller) => _mapController = controller,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            compassEnabled: true,
            markers: markers,
          ),
          if (_error != null)
            Positioned(
              top: 12,
              left: 12,
              right: 12,
              child: Material(
                color: Colors.red.shade900,
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    _error!,
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
              ),
            ),
          Positioned(
            left: 16,
            right: 16,
            bottom: 20,
            child: Card(
              color: const Color(0xFF102A43),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.circle,
                          size: 12,
                          color: _sharingLocation
                              ? Colors.greenAccent
                              : Colors.orange,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _sharingLocation
                                ? 'Live location sharing is active'
                                : 'Waiting for GPS permission/location',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                        ),
                        Text('${_memberMarkers.length} members'),
                      ],
                    ),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: _endingTrip ? null : _endTrip,
                      icon: const Icon(Icons.flag),
                      label: Text(_endingTrip ? 'Ending trip…' : 'End trip'),
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.red.shade700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
